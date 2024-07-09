import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.util.js"
import {ApiResponse} from "../utils/ApiResponse.util.js"
import {asyncHandler} from "../utils/asyncHandler.util.js"
import {uploadOnCloudinary,deleteResourceByUrl} from "../utils/cloudinary.util.js"

const folder = "videos";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    let { title, description} = req.body;
    if(!title)
        throw new ApiError(400,"Title is required");

    // tags = tags || [];
    description = description || "";
    const owner = new mongoose.Types.ObjectId(req.user?._id);

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    if(!thumbnailLocalPath || !videoFileLocalPath)
        throw new ApiError(400,"Thumbnail or video file is missing");

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath,folder,req.user.username);
    const videoFile = await uploadOnCloudinary(videoFileLocalPath,folder,req.user.username);
    if(!thumbnail || !videoFile){
        if(thumbnail){
            await deleteResourceByUrl(thumbnail.url);
        }
        else if(videoFile){
            await deleteResourceByUrl(videoFile.url);
        }
        throw new ApiError(500,"Video upload failed");
    }

    console.log(videoFile);
    try {
        const video = await Video.create(
            {
                title, 
                videoFile:videoFile.url,
                thumbnail:thumbnail.url,
                duration:Math.floor(videoFile.duration),
                owner,
                description
            }
        )

        console.log(video);
        res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Video uploaded successfully",
                 video
            )
        );
    } catch (error) {
        await deleteResourceByUrl(thumbnail.url);
        await deleteResourceByUrl(thumbnail.videoFile);
        throw new ApiError(500,error.message);
    }
    

})

const getVideoById = asyncHandler(async (req, res) => {
    //TODO: get video by id
    const videoId = req.params?.videoId || req.query?.videoId;
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    const storedVideo = await Video.findById(videoObjectId);
    if(!storedVideo || !storedVideo.isPublished)
        throw new ApiError(404, "Video is not available");

    const video = await Video.aggregate(
        [
            {
                $match:{
                    _id: videoObjectId
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[
                        {
                            $lookup:{
                                from:"follows",
                                localField:"_id",
                                foreignField:"followedTo",
                                as:"followers"
                            }
                        },
                        {
                            $addFields:{
                                followerCount:{$size:"$followers"}
                            }
                        },
                        {
                            $project:{fullName:1,username:1,avatar:1,followerCount:1}
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: { $first: "$owner" }
                }
            },
            {
                $project:{
                    title:1,videoFile:1,thumbnail:1,duration:1,owner:1
                }
            }
        ]
    );

    if(!video)
        throw new ApiError(404,"Video not available");

    res
    .status(200)
    .json(
        new ApiResponse(200,"Video fetched successfully",video)
    );
})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const videoId = new mongoose.Types.ObjectId(req.params?.videoId || req.query?.videoId);
    //TODO: update video details like title, description, thumbnail
    // find if such video exists
    // if exists check if its owner is the user
    // take the details to change in body
    // set those details and save the video
    const existingVideo = await Video.findById(videoId);
    if(!existingVideo)
        throw new ApiError(404,"Video does not exist");

    const userId = new mongoose.Types.ObjectId(req.user._id);
    console.log(existingVideo.owner);
    console.log(userId);
    console.log((existingVideo.owner).equals(userId))

    if(!(existingVideo.owner).equals(userId))
        throw new ApiError(401,"Unauthorised attempt to delete resource");

    let updateFields = {};
    const {title,description} = req.body;
    if(title) updateFields.title = title;
    if(description) updateFields.description = description;

    const newThumbnailLocalPath = req.file?.path;
    const existingThumbnailURL = existingVideo.thumbnail;
    if(newThumbnailLocalPath){
        const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath,folder,req.user.username);
        if(newThumbnail){
            updateFields.thumbnail = newThumbnail.url;
        }
        else{
            throw new ApiError(500,"Error in uploading new thumbnail");
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,{
        $set:updateFields
    },{new:true});

    if(!updatedVideo)
        throw new ApiError(500,"Unable to update the profile");

    
    if(updateFields.thumbnail)
        await deleteResourceByUrl(existingThumbnailURL);

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video details updated successfully",
            updatedVideo
        )
    );

})

const deleteVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId || req.query.videoId;
    
    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if(!video)
        throw new ApiError(404,"Video does not exist");

    if(!((video.owner).equals(req.user._id)))
        throw new ApiError(401,"Unauthorised attempt to delete video");

    try {
        await deleteResourceByUrl(video.videoFile);
        await deleteResourceByUrl(video.thumbnail);
        await Video.findByIdAndDelete(video.id);
    } catch (error) {
        console.log(error.message);
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,"Video deleted")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const videoId = req.params?.videoId || req.query?.videoId;
    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const video = await Video.findById(videoObjectId);

    if(!((video.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised Access");

    const publishStatus = !(Boolean(video.isPublished));
    console.log(typeof (video.isPublished),typeof publishStatus);

    await Video.findByIdAndUpdate(videoObjectId,
        {
            $set:{
                isPublished: publishStatus
            }
        }
    )
   
    res
    .status(200)
    .json(
        new ApiResponse(200,`Publish status toggled to ${publishStatus}`)
    );

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}