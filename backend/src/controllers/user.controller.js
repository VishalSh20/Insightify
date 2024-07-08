import {asyncHandler} from "../utils/asyncHandler.util.js"
import {ApiError} from "../utils/ApiError.util.js";
import {ApiResponse} from "../utils/ApiResponse.util.js";
import {deleteResourceByUrl, uploadOnCloudinary} from "../utils/cloudinary.util.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
    httpOnly: true,
    secure: true
};

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken};


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
};

const signupUser = asyncHandler(async(req,res)=>{
    const {username,email,password,fullName,bio} = req.body;
    if([username,email,password,fullName].includes(undefined))
        throw new ApiError(400,"All fields are required");

    bio = bio || "";

    if(email.indexOf('@') === -1)
        throw new ApiError(400,"Email is invalid");

    if(password.length < 8)
        throw new ApiError(400,"Password should contain atleast 8 characters");

    let existingUser = await User.findOne({email});
    if(existingUser)
        throw new ApiError(403,"User with email already exists")

    existingUser = await User.findOne({username});
    if(existingUser)
        throw new ApiError(403,"Username not available")

    const avatarLocalPath = req.files?.avatar?.path;
    console.log(avatarLocalPath);
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    const user = await User.create({
        username,
        email,
        password,
        fullName,
        bio,
        avatar: avatar?.url
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

});

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    if(!password){
        throw new ApiError(400, "Password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.comparePassword(password.trim());

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
        new ApiResponse(
            200, 
            "User logged In Successfully",
            {
                user: loggedInUser, accessToken, refreshToken
            }
        )
    )

});

const logoutUser = asyncHandler(async(req,res)=>{
    const user = req.user;
    await User.findByIdAndUpdate(user._id,{
        $unset:{refreshToken:1}
    });

    res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,"User Logged Out"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const refreshToken = req.cookie("refreshToken") || req.body?.refreshToken;
    if(!refreshToken)
        throw new ApiError(401,"No refresh token");

    const decodedToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    try {
        const user = await User.findById(decodedToken?._id);
        if(!user || user.refreshToken !== refreshToken)
            throw new ApiError("Invalid Refresh Token");
    
        const [accessToken,newRefreshToken] = await generateAccessAndRefereshTokens(user._id);
        if(!accessToken || !newRefreshToken)
            throw new ApiError(500,"Something went wrong in generation of new tokens");
    
        res
        .status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",refreshToken)
        .json(new ApiResponse(
            200,
            "Tokens refreshed successfully",
            {
                accessToken,refreshToken:newRefreshToken
            }
        ))
    } catch (error) {
        throw new ApiError(401,error.message);
    }

});

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = await User.aggregate(
        [
            {
                $match:{_id:req.user._id}
            },
            {
                $lookup:{
                    from:"follows",
                    localField:"_id",
                    foreignField:"followedTo",
                    as:"followers"
                }
            },
            {
                $addFields:{
                    followers: {$first : "$followers"}
                }
            },
            {
                $lookup:{
                    from:"follows",
                    localField:"_id",
                    foreignField:"followedBy",
                    as:"followings"
                }
            },
            {
                $addFields:{
                    followings: {$first : "$followings"}
                }
            },
            {
                $addFields:{
                    followerCount:{
                        $size : "$followers"
                    },
                    followingCount:{
                        $size: "$followings"
                    }
                }
            },
            {
                $lookup:{
                    from: "blogs",
                    localField:"blogs",
                    foreignField:"_id",
                    as:"blogs",
                    pipeline:[
                        {
                            $project:{
                                title,coverImage
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    blogs: {$first:"$blogs"}
                }
            },
            {
                $lookup:{
                    from: "videos",
                    localField:"videos",
                    foreignField:"_id",
                    as:"videos",
                    pipeline:[
                        {
                            $project:{
                                title,thumbnail
                            }
                        }
                    ]
                }   
            },
            {
                $addFields:{
                    blogs: {$first:"$videos"}
                }
            },
            {
                $lookup:{
                    from: "discussions",
                    localField:"discussions",
                    foreignField:"_id",
                    as:"discussions",
                    pipeline:[
                        {
                            $project:{
                                title,thumbnail
                            }
                        }
                    ]
                }   
            },
            {
                $addFields:{
                    blogs: {$first:"$discussions"}
                }
            }
        ]
    )

    if(!user)
        throw new ApiError(500,"Unable to get details at the moment");

    res
    .status(200)
    .json(
        new ApiResponse(200,"Current User fetched successfully",user)
    )

});

const updateUserDetails = asyncHandler(async(req,res)=>{
   const {fullName,bio} = req.body;
   if([fullName,bio].includes(undefined))
    throw new ApiError("All fields are required");

   await User.findByIdAndUpdate(req.user.id,{
    $set:{
        fullName,
        bio
    }
   });

   res
   .status(200)
   .json(new ApiResponse(200,"User updated successfully"));
});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully",{}))
});

const changeAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;
    const currentAvatarUrl = req.user?.avatar;
   try {
     if(currentAvatarUrl){
        deleteResourceByUrl(currentAvatarUrl);
     }
 
     const updatedAvatar = await uploadOnCloudinary(avatarLocalPath);
     if(!updatedAvatar)
         throw new ApiError(500,"Unable to update the avatar");
 
     await User.findByIdAndUpdate(req.user._id,
         {
             $set: {avatar:updatedAvatar.url}
         }
     );
 
     res
     .status(200)
     .json(new ApiResponse(200,"Avatar changed successfully"));  
   } 
   catch (error) {
    throw new ApiError(500,error.message);
   }  
});

const deleteCurrentUser = asyncHandler(async(req,res)=>{
    try {
        await User.findByIdAndDelete(req.user._id);
        res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200,"User deleted successfully"));
    } catch (error) {
        throw new ApiError(500,error.message);
    }
});

export {
    signupUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUserDetails,
    changeCurrentPassword,
    getCurrentUser,
    changeAvatar,
    deleteCurrentUser
};
