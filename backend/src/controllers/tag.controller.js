import mongoose from "mongoose";
import { Tag } from "../models/tag.model.js";
import {ApiError} from "../utils/ApiError.util.js"
import {ApiResponse} from "../utils/ApiResponse.util.js"
import {asyncHandler} from "../utils/asyncHandler.util.js"
import { response } from "express";

const getAllTags = asyncHandler(async(req,res)=>{
    const allTags = await Tag.find({});
    res
    .status(200)
    .json(new ApiResponse(200,"All Tags fetched successfully",allTags));
});

const addTags = asyncHandler(async(req,res)=>{
    const {tags} = req.body;
    if(!tags)
        throw new ApiError(400,"Tags are required");
    
    const addedTags = [];
    for(let i=0; i<tags.length; i++){
        const existingTag = await Tag.findOne({name:tags[i]});
        if(!existingTag){
            const newTag = await Tag.create({name:tags[i]});
            if(!newTag)
                throw new ApiError(500,"Error in adding tag- ",tags[i]);

            addedTags.push(newTag);
        }
    }

    res
    .status(200)
    .json(new ApiResponse(200,"Tags added successfully",addedTags));
});

const deleteTag = asyncHandler(async(req,res)=>{
    const {tag} = req.body;
    if(!tag)
        throw new ApiError(400,"Tag is required");

    await Tag.findOneAndDelete({name:tag});
    
    res
    .status(200)
    .json("Tag deleted successfully");
})

export {getAllTags,
        addTags,
        deleteTag
        };