import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import {Follow} from "../models/follow.model.js"

const toggleFollow = asyncHandler(async (req,res)=>{
    const currUserId = new mongoose.Types.ObjectId(req.user?._id);
    const followUserId = new mongoose.Types.ObjectId(req.params?.userId);
    if(!followUserId)
        throw new ApiError(400,"UserId is required");

    if(followUserId.equals(currUserId))
        throw new ApiError(400,"User can not follow himself");

    const existingFollow = await Follow.findOne({
        followBy:currUserId,followTo:followUserId
    });

    if(existingFollow){
        await Follow.findByIdAndDelete(followUserId);
    }
    else{
        await Follow.create({followBy:currUserId,followTo:followUserId});
    }

    res
    .status(200)
    .json(new ApiResponse(200,`User follow toggled suggessfully`));
});

const getUserFollowers = asyncHandler(async(req,res)=>{
    const userId = new mongoose.Types.ObjectId(req.params?.userId);
    const followInstances = await Follow.aggregate(
        [
            {
                $match:{
                    followTo:userId
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"followBy",
                    foreignField:"_id",
                    as:"follower",
                    pipeline:[
                        {
                            $project:{
                                username:1 , email:1 , avatar:1,fullName:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    follower:{$first:"$follower"}
                }
            }
        ]
    );

    let userFollowers = [];
    followInstances.forEach((instance)=>(userFollowers.push(instance.follower)));

    res
    .status(200)
    .json(new ApiResponse(200,"User Followers Fetched Successfully",userFollowers));
});

const getUserFollowings = asyncHandler(async(req,res)=>{
    const userId = new mongoose.Types.ObjectId(req.params?.userId);
    const followInstances = await Follow.aggregate(
        [
            {
                $match:{
                    followBy:userId
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"followTo",
                    foreignField:"_id",
                    as:"following",
                    pipeline:[
                        {
                            $project:{
                                username:1 , email:1 , avatar:1,fullName:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    following:{$first:"$following"}
                }
            }
        ]
    );

    let userFollowings = [];
    followInstances.forEach((instance)=>(userFollowings.push(instance.following)));

    res
    .status(200)
    .json(new ApiResponse(200,"User Followings Fetched Successfully",userFollowings));
});

export {
    getUserFollowings,
    getUserFollowers,
    toggleFollow,
};
