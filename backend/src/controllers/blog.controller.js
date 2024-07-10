import mongoose, { mongo } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { Blog } from "../models/blog.model.js";
import { deleteResourceByUrl, uploadOnCloudinary } from "../utils/cloudinary.util.js";

const publishBlog = asyncHandler(async(req,res)=>{
    const user = req.user;
    const {title,description,content} = req.body;
    if(!title || !content)
        throw new ApiError(400,"Title and Content are required");

    let uploadFields = {title,content};
    uploadFields.description = description || "";
    uploadFields.owner = new mongoose.Types.ObjectId(req.user?._id);

    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath)
        throw new ApiError(400,"CoverImage is Required");

    const coverImage = await uploadOnCloudinary(coverImage,user.username,"blog");
    if(!coverImage)
        throw new ApiError(500,"CoverImage upload failed");

    const blog = await Blog.create(
        {
            ...uploadFields,coverImage:coverImage.url
        }
    )

    if(!blog)
        throw new ApiError(500,"Blog Publish Failed");
    
    res
    .status(200)
    .json(new ApiResponse(200,"Blog published successfully",blog));
});

const updateBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.params;
    if(!blogId)
        throw new ApiError(400,"BlogId is required");

    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const blog = await Blog.findById(blogObjectId);
    if(!blog)
        throw new ApiError(404,"Blog does not exist");
    if(!((blog.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised attempt to alter blog");

    const {title,content,description} = req.body;
    let updateFields;
    if(title) updateFields.title = title;
    if(content) updateFields.content = content;
    if(description) updateFields.description = description;

    const updatedBlog = await Blog.findByIdAndUpdate(blogObjectId,
        {
            $set:updateFields
        }
    );
     
    if(!updateBlog)
        throw new ApiError(500,"Error in updating the blog");

    res
    .status(200)
    .json(new ApiResponse(200,"Blog Updated Successfully",updateBlog));

});

const deleteBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.params;
    if(!blogId)
        throw new ApiError(400,"BlogId is required");

    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const blog = await Blog.findById(blogObjectId);
    if(!blog)
        throw new ApiError(404,"Blog does not exist");
    if(!((blog.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised attempt to delete blog");

    await Blog.findByIdAndDelete(blogObjectId);

    res
    .status(200)
    .json(new ApiResponse(200,"Blog deleted successfully"));

});

const changeCoverImage = asyncHandler(async(req,res)=>{
    const {blogId} = req.params;
    if(!blogId)
        throw new ApiError(400,"BlogId is required");

    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const blog = await Blog.findById(blogObjectId);
    if(!blog)
        throw new ApiError(404,"Blog does not exist");
    if(!((blog.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised attempt to alter blog");

    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath)
        throw new ApiError(400,"Cover Image is required");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    await deleteResourceByUrl(blog.coverImage);
    const updatedBlog = await Blog.findByIdAndUpdate(blogObjectId,{
        $set:{coverImage}
    },{new:true});

    res
    .status(200)
    .json(new ApiResponse(200,"Cover Image updated successfully"));
});

const getBlogById = asyncHandler(async(req,res)=>{
    const {blogId} = req.params;
    if(!blogId)
        throw new ApiError(400,"BlogId is required");

    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const blog = await Blog.aggregate(
        [
            {
                $match:{_id:blogObjectId}
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner",
                    pipeline:[
                        {
                            $project:{username:1,email:1,fullName:1,avatar:1}
                        }
                    ]
                }
            },
            {
                $addFields:{
                    owner:{$first:"$owner"}
                }
            },
            {
                $lookup:{
                    from:"likes",
                    localField:"_id",
                    foreignField:"likedTo",
                    as:"likes"
                }
            },
            {
                $addFields:{
                    likesCount: {$size:"$likes"}
                }
            },
            {
                $project:{
                    title:1,coverImage:1,description:1,content:1,owner:1,likesCount:1
                }
            }
        ]
    );

    if(!blog)
        throw new ApiError(404,"Blog does not exist");
    
    res
    .status(200)
    .json(new ApiResponse(200,"Blog Fetched Successfully"));
});
export {
    publishBlog,
    updateBlog,
    deleteBlog,
    changeCoverImage,
    getBlogById
};