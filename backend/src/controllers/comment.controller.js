import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.util.js"
import {ApiResponse} from "../utils/ApiResponse.util.js"
import {asyncHandler} from "../utils/asyncHandler.util.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

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
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }