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

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken};
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
};

const signupUser = asyncHandler(async(req,res)=>{
    const {username,email,password,fullName="User",bio} = req.body;
    if([username,email,password].includes(undefined))
        throw new ApiError(400,"All fields are required");

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

    const avatarLocalPath = req.file?.path;
    
    const avatar = (avatarLocalPath) ? await uploadOnCloudinary(avatarLocalPath,username,"image") : {url:""};
    // if(!avatar)
    //     throw new ApiError(500,"Unable to upload avatar");

    const user = await User.create({
        username,
        email,
        password,
        fullName,
        bio:bio||"",
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
    throw new ApiError(401,"Incorrect Password");
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
                user: loggedInUser,
                 accessToken,
                 refreshToken
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")     
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
        console.log(accessToken,refreshToken);
        return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200, 
                {accessToken, 
                refreshToken
            },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

});

const getCurrentUser = asyncHandler(async(req,res)=>{
    const user = await User.aggregate(
        [
            {
                $match:{username:req.user.username}
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
                $lookup:{
                    from:"follows",
                    localField:"_id",
                    foreignField:"followedBy",
                    as:"followings"
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
            }
        ]);

        if(!user) 
            throw new ApiError(500,"Error in retrieving user details");

        res
        .status(200)
        .json(
            new ApiResponse(200,"User retrieved successfully",user)
        )
});

const getUserProfile = asyncHandler(async(req,res)=>{
    const username = req.params?.username;
    const user = await User.aggregate(
        [
            {
                $match:{username}
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
   console.log("Here");
   const {fullName="",username="",tagline="",bio="",links=[],deleteCurrentAvatar=false} = req.body;
   console.log(req.body);
    
   const existingUser = await User.findOne({username});
   if(username){
    if(existingUser && req.user.username !== username.toLowerCase())
        throw new ApiError(403,"Username not available");
   }

   const avatarLocalPath = req.file?.path;
   const currentAvatar = req.user.avatar;
   if(deleteCurrentAvatar){
      await deleteResourceByUrl(currentAvatar);
      await User.findByIdAndUpdate(req.user._id,{$set:{avatar:""}})
   }
       
   if(avatarLocalPath){
       const newAvatar = await uploadOnCloudinary(avatarLocalPath,req.user.username,'image');
       if(!newAvatar)
        throw new ApiError(500,"Error in Uploading Avatar");
    
     await User.findByIdAndUpdate(req.user._id,{$set:{avatar:newAvatar.url}});
    }


   const updatedUser = await User.findByIdAndUpdate(req.user.id,{
    $set:{
        fullName,
        username,
        tagline,
        bio,
        links:links || []
    }
   },{new:true});

   res
   .status(200)
   .json(new ApiResponse(200,"User updated successfully",{user:updatedUser}));
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
   const newAvatarPath = req.file.path;
   console.log(newAvatarPath);
   const oldAvatarURL = req.user.url;
   if(oldAvatarURL !== undefined && oldAvatarURL !== null){
    try {
        await deleteResourceByUrl(oldAvatarURL);
    } catch (error) {
       console.error("Old file removal failed");
    }
   }
 
    const updatedAvatar = await uploadOnCloudinary(newAvatarPath,req.user.username,"image");
    if(!updatedAvatar)
        throw new ApiError(500,"Avatar upload failed");
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{avatar:updatedAvatar.url}
    },{new:true});
    if(!user)
    throw new ApiError(500,error?.message || "Uploading failed"); 

   res
   .status(200)
   .json(new ApiResponse(200,"Avatar uploaded successfully"));
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
    getUserProfile,
    changeAvatar,
    deleteCurrentUser
};
