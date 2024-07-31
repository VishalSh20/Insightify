import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { Blog } from "../models/blog.model.js";
import { deleteResourceByUrl, uploadOnCloudinary } from "../utils/cloudinary.util.js";

const getAllBlogs = asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, query, sortBy='createdAt', sortType='asc'} = req.query
    //TODO: get all blogs based on query, sort, pagination
    const {tags,userIds} = req.body;

    let matchStage = {isPublished:true};
    if(query){
        matchStage.title = { $regex: query, $options: 'i' };
        matchStage.description = { $regex: query, $options: 'i' }; 
    }
    if(userIds){
        let userObjectIds = [];
        userIds.forEach(id => {userObjectIds.push(new mongoose.Types.ObjectId(id))});
        matchStage.owner = {$in : userObjectIds};
    }
    if(tags){
        let tagObjectIds = [];
        tags.forEach(id => {tagObjectIds.push(new mongoose.Types.ObjectId(id))});
        matchStage.tags = {$in :tagObjectIds};
    }

    let sortStage = {};
    if(sortBy){
        sortStage[sortBy] = (sortType==='asc' || sortType==='1') ? 1: -1;
    }

    const pipeline = [
        {$match : matchStage},
        {$lookup: {
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
             {
                $project:{
                    username:1,email:1,avatar:1,fullName:1
                }
             }
            ]
        }
    },
    {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"blogId",
            as:"likes"
        }
    },
    {
      $addFields:{
        likesCount:{$size:"$likes"}
      }
    },
    {
        $project:{
            title:1,description:1,coverImage:1,owner:1,likesCount:1,createdAt:1
        }
    },
    {$sort: sortStage}
    ];

    const blogs = await Blog.aggregatePaginate(pipeline,{page:page , limit: limit});
    req
    .status(200)
    .json(new ApiResponse(200,"Blogs fetched successfully",blogs));

});

const publishBlog = asyncHandler(async(req,res)=>{
    const user = req.user;
    const {title,description,content,tags,isPublished} = req.body;
    if(!title || !content)
        throw new ApiError(400,"Title and Content are required");

    let uploadFields = {title,content,isPublished};
    uploadFields.description = description || "";
    uploadFields.owner = new mongoose.Types.ObjectId(req.user?._id);
    uploadFields.tags = (tags || []).map((tagId)=> new mongoose.Types.ObjectId(tagId));

    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath)
        throw new ApiError(400,"CoverImage is Required");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath,user.username,"image");
    if(!coverImage)
        throw new ApiError(500,"CoverImage upload failed");

    const blog = await Blog.create(
        {
            ...uploadFields,coverImage:coverImage.url
        }
    )

    if(!blog)
        throw new ApiError(500,"Blog Publish Failed");
    
    console.log("Hi");
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

    const {title,content,description,tags} = req.body;

    let updateFields = {};
    if(title) updateFields.title = title;
    if(content) updateFields.content = content;
    if(description) updateFields.description = description;
    if(tags) updateFields.tags = tags.map((tagId) => new mongoose.Types.ObjectId(tagId));

    const updatedBlog = await Blog.findByIdAndUpdate(blogObjectId,
        {
            $set:updateFields
        },
        {new:true}
    );
     
    if(!updatedBlog)
        throw new ApiError(500,"Error in updating the blog");

    res
    .status(200)
    .json(new ApiResponse(200,"Blog Updated Successfully",updatedBlog));

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

    const coverImage = await uploadOnCloudinary(coverImageLocalPath,req.user.username,"image");
    await deleteResourceByUrl(blog.coverImage);
    const updatedBlog = await Blog.findByIdAndUpdate(blogObjectId,{
        $set:{coverImage:coverImage.url}
    },{new:true});

    res
    .status(200)
    .json(new ApiResponse(200,"Cover Image updated successfully",updatedBlog));
});

const addTagToBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.params;
    if(!blogId)
        throw new ApiError(400,"blog Id is required");
    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const blog = await blog.findById(blogObjectId);
    if(!blog)
        throw new ApiError(404,"blog does not exist");

    const {tag} = req.body;
    if(!tag)
        throw new ApiError(400,"Tag is required");
    const tagObjectId = new mongoose.Types.ObjectId(tag);

    if(blog.tags.includes(tagObjectId))
        throw new ApiError(403,"Tag already exists");

    blog.tags.push(tagObjectId);
    await blog.save();

    res
    .status(200)
    .json(new ApiResponse(200,"Tag added successfully",{tags:blog.tags}));
}); 

const getBlogById = asyncHandler(async(req,res)=>{
    const {blogId} = req.params;
    if(!blogId)
        throw new ApiError(400,"BlogId is required");

    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const blog = await Blog.aggregate(
        [
            {
                $match:{_id:blogObjectId,
                    isPublished:true
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
                    foreignField:"blogId",
                    as:"likes"
                }
            },
            {
                $addFields:{
                    likesCount: {$size:"$likes"}
                }
            },
            {
                $lookup:{
                    from:"tags",
                    localField:"tags",
                    foreignField:"_id",
                    as:"tags",
                    pipeline:[
                        {
                            $project:{name:1}
                        }
                    ]
                }
            },
            {
                $project:{
                    title:1,coverImage:1,description:1,content:1,owner:1,likesCount:1,createdAt:1,tags:1
                }
            }
        ]
    );

    if(!blog)
        throw new ApiError(404,"Blog does not exist");

    res
    .status(200)
    .json(new ApiResponse(200,"Blog Fetched Successfully",blog));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const blogId = req.params?.blogId || req.query?.blogId;
    const blogObjectId = new mongoose.Types.ObjectId(blogId);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const blog = await blog.findById(blogObjectId);

    if(!((blog.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised Access");

    const publishStatus = !(Boolean(blog.isPublished));
    console.log(typeof (blog.isPublished),typeof publishStatus);

    await blog.findByIdAndUpdate(blogObjectId,
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

});

export {
    getAllBlogs,
    publishBlog,
    updateBlog,
    addTagToBlog,
    deleteBlog,
    changeCoverImage,
    getBlogById,
    togglePublishStatus
};