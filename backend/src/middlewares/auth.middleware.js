import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";

const verifyAccessToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "No Access Token available");
  }

  try {
    console.log("Token-",token);
    console.log("AS-",process.env.ACCESS_TOKEN_SECRET);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decodedToken)
      throw new ApiError(401,"Access token expired or invalid");
    
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
    if (!user) {
      throw new ApiError(401, "Access token invalid");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Access token expired or invalid");
    } else {
      throw new ApiError(error.message);
    }
  }
});

export { verifyAccessToken };
