import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.util.js"
import {ApiResponse} from "../utils/ApiResponse.util.js"
import {asyncHandler} from "../utils/asyncHandler.util.js"

const getComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {targetType,targetId} = req.params
    const {page = 1, limit = 10 , sortBy = 'asc',sortType ='asc'} = req.query

    let matchStage = {isPublished:true};
    switch(targetType){
      case "video":
        matchStage.videoId = new mongoose.Types.ObjectId(targetId);
        break;
      case "blog" :
        matchStage.blogId = new mongoose.Types.ObjectId(targetId);
        break;
      case "discussion":
        matchStage.discussionId = new mongoose.Types.ObjectId(targetId);;
        break;
      default:
        throw new ApiError("Invalid Target type");
    }

    let sortStage = {};
    if(sortBy){
      sortStage[sortBy] = (sortType==='asc' || sortType==='1') ? 1 : -1;
    }
    const pipeline = [
      {$match: matchStage},
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
                foreignField:"commentId",
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
                content:1,owner:1,likesCount:1,createdAt:1
            }
        },
    {$sort: {createdAt:1}}];
    const comments = await Comment.aggregatePaginate(pipeline,{page,limit});
    res
    .status(200)
    .json(new ApiResponse(200,"Comments fetched successfully"));

})

const addComment = asyncHandler(async (req, res) => {
      const { content } = req.body;
      const { targetType, targetId } = req.params || req.query; // New parameters for target type and ID
  
      if (!content) {
        throw new ApiError(400, "Comment content is required");
      }
      
      console.log(targetType,targetId);
      const userId = new mongoose.Types.ObjectId(req.user._id);
      let newComment;
      switch (targetType) {
        case "video":
          newComment = await Comment.create({content,videoId:targetId,commentedBy:userId}); // Assuming videoId field
          break;
        case "blog":
          newComment = await Comment.create({ content, blogId: targetId ,commentedBy:userId}); // Assuming blogId field
          break;
        case "discussion":
          newComment = await Comment.create({ content, discussionId: targetId ,commentedBy:userId}); // Assuming discussionId field
          break;
      }
  
      res
      .status(200)
      .json(       
          new ApiResponse(201, "Comment added successfully", newComment)
        );
    
  });
  
const updateComment = asyncHandler(async (req, res) => {
  
      const commentId = req.params.commentId || req.query.commentId;
      const commentObjectId = new mongoose.Types.ObjectId(commentId);
      const {content} = req.body;
  
      if (!content) {
        throw new ApiError(400, "Comment content is required");
      }
  
      const updatedComment = await Comment.findByIdAndUpdate(commentObjectId, { content }, { new: true });
  
      if (!updatedComment) {
        throw new ApiError(404,"Comment not found");
      }

      res
      .status(200)
      .json(
      new ApiResponse(
        200, 
        "Comment updated successfully", 
        updatedComment)
     );

  });
  
const deleteComment = asyncHandler(async (req, res) => {
    try {
      const commentId = req.params.commentId || req.query.commentId;
      const commentObjectId = new mongoose.Types.ObjectId(commentId);
      const deletedComment = await Comment.findByIdAndDelete(commentObjectId);
  
      if (!deletedComment) {
        throw new ApiError(404, "Comment not found");
      }
  
      res.
      status(200)
      .json(new ApiResponse(200, "Comment deleted successfully"));
    }
     catch (error) {
      console.error(error);
      throw new ApiError(500, "Internal server error");
    }
  });

export {
    getComments, 
    addComment, 
    updateComment,
    deleteComment
}