import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";

const verifyAccessToken = asyncHandler(async(req,res,next)=>{
   
    const token = req.cookies.accessToken || req.header("Authorization")?.replace('Bearer ',"");
    console.log(token);
    if(!token)
        throw new ApiError(401,"No Access Token available");

   try {
    let decodedToken = {};
    try {
       decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw new ApiError(401,"Unauthorised Access");
    }
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
     if(!user)
         throw new ApiError(401,"Unauthorised Access");
 
     req.user = user;
     next();
   } catch (error) {
      //  console.log(error.message);
      //  throw new ApiError(error.message);
   }

});

export {verifyAccessToken};