import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { Discussion } from "../models/discussion.model.js";
import mongoose from "mongoose";

const getAllDiscussions = asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, query, sortBy='createdAt', sortType='asc'} = req.query
    //TODO: get all discussions based on query, sort, pagination
    const {tags,userIds} = req.body;

    let matchStage = {isPublished:true};
    if(query){
        matchStage.title = { $regex: query, $options: 'i' };
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
            foreignField:"discussionId",
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
            title:1,content:1,owner:1,likesCount:1,createdAt:1
        }
    },
        {$sort: sortStage}
    ];

    const discussions = await Discussion.aggregatePaginate(pipeline,{page:page , limit: limit});
    req
    .status(200)
    .json(new ApiResponse(200,"Discussions fetched successfully",discussions));

});

const createDiscussion = asyncHandler(async(req,res)=>{
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const {title,content,tags} = req.body;

    if(!title || !content)
        throw new ApiError(400,"Title and content are required");
    
    let addFields = {title,content}
    if(tags)
        addFields.tags = tags.map((tagId) => new mongoose.Types.ObjectId(tagId));

    const discussion = await Discussion.create(addFields);

    res
    .status(200)
    .json(new ApiResponse(200,"Discussion created successfully",discussion));

});

const updateDiscussion = asyncHandler(async(req,res)=>{
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const {discussionId} = req.params;
    if(!discussionId)
        throw new ApiError(400,"Discussion Id is required");
    const discussionObjectId = new mongoose.Types.ObjectId(discussionId);

    const existingDiscussion = await Discussion.findById(discussionObjectId);
    if(!existingDiscussion)
        throw new ApiError(404,"Discussion does not exist");

    if(!((existingDiscussion.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised attempt to update discussion");

    // now updating the values
    const {title,content,tags} = req.body;
    let updateFields = {};
    if(title) updateFields.title = title;
    if(content) updateFields.content = content;
    if(tags) updateFields.tags = tags.map((tagId) => new mongoose.Types.ObjectId(tagId));

    const updatedDiscussion = await Discussion.findByIdAndUpdate(discussionObjectId,
        {
            $set: updateFields
        },
        {new:true}
    );

    res
    .status(200)
    .json(new ApiResponse(200,"Discussion updated successfully",updatedDiscussion));
});

const deleteDiscussion = asyncHandler(async(req,res)=>{
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const {discussionId} = req.params;
    if(!discussionId)
        throw new ApiError(400,"Discussion Id is required");
    const discussionObjectId = new mongoose.Types.ObjectId(discussionId);

    const existingDiscussion = await Discussion.findById(discussionObjectId);
    if(!existingDiscussion)
        throw new ApiError(404,"Discussion does not exist");

    if(!((existingDiscussion.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised attempt to delete discussion");

    await Discussion.findByIdAndDelete(discussionObjectId);

    res
    .status(200)
    .json(new ApiResponse(200,"Discussion deleted successfully"));
});

const addTagToDiscussion = asyncHandler(async(req,res)=>{
    const {discussionId} = req.params;
    if(!discussionId)
        throw new ApiError(400,"discussion Id is required");
    const discussionObjectId = new mongoose.Types.ObjectId(discussionId);
    const discussion = await discussion.findById(discussionObjectId);
    if(!discussion)
        throw new ApiError(404,"discussion does not exist");

    const {tag} = req.body;
    if(!tag)
        throw new ApiError(400,"Tag is required");
    const tagObjectId = new mongoose.Types.ObjectId(tag);

    if(discussion.tags.includes(tagObjectId))
        throw new ApiError(403,"Tag already exists");

    discussion.tags.push(tagObjectId);
    await discussion.save();

    res
    .status(200)
    .json(new ApiResponse(200,"Tag added successfully",{tags:discussion.tags}));
}); 

const getDiscussionById = asyncHandler(async(req,res)=>{
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const {discussionId} = req.params;
    if(!discussionId)
        throw new ApiError(400,"Discussion Id is required");
    const discussionObjectId = new mongoose.Types.ObjectId(discussionId);

    const existingDiscussion = await Discussion.findById(discussionObjectId);
    if(!existingDiscussion)
        throw new ApiError(404,"Discussion does not exist");

    const discussion = await Discussion.aggregate([
        {
            $match:{_id:discussionObjectId,
                isPublished:true
            },
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
                foreignField:"discussionId",
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
                title:1,content:1,owner:1,likesCount:1,tags:1
            }
        }
       
    ]);

    res
    .status(200)
    .json(new ApiResponse(200,"Discussion fetched successfully",discussion));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const discussionId = req.params?.discussionId || req.query?.discussionId;
    const discussionObjectId = new mongoose.Types.ObjectId(discussionId);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const discussion = await discussion.findById(discussionObjectId);

    if(!((discussion.owner).equals(userId)))
        throw new ApiError(401,"Unauthorised Access");

    const publishStatus = !(Boolean(discussion.isPublished));
    console.log(typeof (discussion.isPublished),typeof publishStatus);

    await discussion.findByIdAndUpdate(discussionObjectId,
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

export{
    getAllDiscussions,
    createDiscussion,
    updateDiscussion,
    addTagToDiscussion,
    deleteDiscussion,
    getDiscussionById,
    togglePublishStatus
};