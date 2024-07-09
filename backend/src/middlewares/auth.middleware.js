import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";

const verifyAccessToken = asyncHandler(async(req,res,next)=>{
    const token = req.cookies.accessToken || req.header("Authorization")?.replace('Bearer ',"");
    if(!token)
        throw new ApiError(401,"No Access Token available");

   try {
     const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
     if(!user)
         throw new ApiError(401,"Unauthorised Access");
 
     req.user = user;
     next();
   } catch (error) {
        next(error);
   }

});

export {verifyAccessToken};