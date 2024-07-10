import { Video } from "../models/video.model.js";
import {Blog} from "../models/blog.model.js";
import {Discussion} from '../models/discussion.model.js';
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import mongoose from "mongoose";

const checkAvailability = asyncHandler(async(req,res,next)=>{
    const {targetType,targetId} = req.params;
    if(!targetType || !targetId)
        throw new ApiError(404,"Resource not available");

    const targetObjectId = new mongoose.Types.ObjectId(targetId);
    const validTargetTypes = ["video","blog","discussion"];
    if(!validTargetTypes.includes(targetType))
        throw new ApiError(400,"Invalid Target type");

    let resource;
    switch(targetType){
        case "video":
            resource = await Video.findById(targetObjectId);
            break;
        case "blog" :
            resource = await Blog.findById(targetObjectId);
            break;
        case "discussion":
            resource = await Discussion.findById(targetObjectId);
            break;
        case "comment":
            resource = await Comment.findById(targetObjectId);
            break;
    }

    if(!resource || (targetType!="comment" && !resource.isPublished))
        throw new ApiError(404,"Resource is not available");
    
    next();
});

export {checkAvailability};