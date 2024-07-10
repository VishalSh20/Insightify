import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.util.js"
import {ApiResponse} from "../utils/ApiResponse.util.js"
import {asyncHandler} from "../utils/asyncHandler.util.js"

const toggleLike = asyncHandler(async (req, res) => {
  const {targetType,targetId} = req.params;
  const targetObjectId = new mongoose.Types.ObjectId(targetId);
  const userId = new mongoose.Types.ObjectId(req.user._id);

  let existingLike;
  switch(targetType){
    case "video":
        existingLike = await Like.findOne({videoId:targetObjectId,likedBy:userId});
        break;
    case "blog":
        existingLike = await Like.findOne({blogId:targetObjectId,likedBy:userId});
        break;
    case "discussion":
        existingLike = await Like.findOne({discussionId:targetObjectId,likedBy:userId});
        break;
    case "comment":
        existingLike = await Like.findOne({commentId:targetObjectId,likedBy:userId});
        break;
  }

  if(existingLike){
    await Like.findByIdAndDelete(existingLike._id);
  }
  else{
      switch(targetType){
        case "video":
            await Like.create({videoId:targetObjectId,likedBy:userId});
            break;
        case "blog":
            await Like.create({blogId:targetObjectId,likedBy:userId});
            break;
        case "discussion":
            await Like.create({discussionId:targetObjectId,likedBy:userId});
            break;
        case "comment":
            await Like.create({commentId:targetObjectId,likedBy:userId});
            break;
      }
  }

    res
    .status(200)
    .json(new ApiResponse(200,"Like toggled successfully"));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videoLikes = await Like.aggregate([
        {
           
                $match:{
                likedBy: req.user._id,
                videoId: { $exists: true }
                }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videoId",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1 , username:1, email:1,avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {$first:"$owner"}
                        }
                    },
                    {
                        $project:{
                            title:1 , thumbnail:1, videoFile:1 , owner:1,duration:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                video: {$first:"$video"}
            }
        },
        {
            $project:{
                video:1
            }
        }
    ]);

    let likedVideos = [];
    videoLikes.forEach((like)=>(likedVideos.push(like.video)));

    res
    .status(200)
    .json(
        new ApiResponse(200,"Liked videos fetched successfully",likedVideos)
    );
});

const getLikedBlogs = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const blogLikes = await Like.aggregate([
        {
           
                $match:{
                likedBy: req.user._id,
                blogId: { $exists: true }
                }
        },
        {
            $lookup:{
                from:"blogs",
                localField:"blogId",
                foreignField:"_id",
                as:"blog",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1 , username:1, email:1,avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {$first:"$owner"}
                        }
                    },
                    {
                        $project:{
                            title:1 , coverImage:1, owner:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                blog: {$first:"$blog"}
            }
        },
        {
            $project:{
                blog:1
            }
        }
    ]);

    let likedBlogs = [];
    blogLikes.forEach((like)=>(likedBlogs.push(like.blog)));

    res
    .status(200)
    .json(
        new ApiResponse(200,"Liked videos fetched successfully",likedBlogs)
    );
});

export {
    toggleLike,
    getLikedVideos,
    getLikedBlogs
}