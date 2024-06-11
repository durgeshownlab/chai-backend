import {asyncHandler} from '../utils/asyncHanndler.js';
import { ApiError } from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId)=>{
   try{
      const user = await User.findById(userId)

      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // console.log(accessToken, refreshToken)

      user.refreshToken=refreshToken;

      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken};
   }
   catch(error){
      throw new ApiError(500, 'something went wrong while generating refresh and access token')
   }
}

// controller for register user 
const registerUser=asyncHandler(async (req, res)=>{
   
   // get user details form the frontend
   // validation not empty
   // check if user already exist: username email
   // check for the image, check for avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db
   // remove password and refresh token field form the response
   // check for the user creation
   // return response 

   const {fullName, email, username, password} = req.body;
   console.log(fullName, email, username, password)


   if([fullName, email, username, password].some((field)=>field?.trim()==="")) {
      throw new ApiError(400, "All fields are required");
   }

   const existedUser=await User.findOne({
      $or: [{username}, {password}]
   })

   if(existedUser) {
      throw new ApiError(409, "User with email or username already exist")
   }

   console.log(req.files)

   const avatarLocalPath = req.files?.avatar[0]?.path;


   if(!avatarLocalPath) {
      throw new ApiError(400, "Avatar File is required")
   }

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
      throw new ApiError(400, "Avatar File is required")
   }

   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if(!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
   }

   return res.status(201).json(
      new ApiResponse(200, createdUser, 'User registered successfully')
   )

});

// controller for login user 
const loginUser=asyncHandler(async (req, res)=>{
   // data from req.body 
   // username or email 
   // find the user
   // password check 
   // access and refresh token 
   // send cookie

   const {username, email, password}=req.body;

   console.log(req.body)

   if(!username && !email) {
      throw new ApiError(400, "username or email is required");
   }

   const user = await User.findOne({
      $or: [{username}, {email}]
   });

   if(!user) {
      throw new ApiError(400, "username doesn't exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)


   if(!isPasswordValid) {
      throw new ApiError(401, "invalid user credentials")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

   console.log(accessToken, refreshToken)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options={
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser,
            refreshToken,
            accessToken,
         },
         "user logged in successfully"
      )
   )

});

// controller for logout user 
const logoutUser=asyncHandler(async (req, res)=>{
   console.log('logout hit')
   console.log(req.user)
   const updatedUser=await User.findOneAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )

   console.log("updated user")
   console.log(updatedUser)

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken")
   .clearCookie("refreshToken")
   .json(new ApiResponse(200, {}, "User logged out"))

});

// controller for refreshing the access token 
const refreshAccessToken=asyncHandler(async (req, res)=>{
   try {
      const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken;
   
      if(!incomingRefreshToken) {
         throw new ApiError(401, "Unauthorized request")
      }
   
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
      const user = await User.findById(decodedToken?._id)
   
      if(!user) {
         throw new ApiError(401, "Invalid refresh token")
      }
   
      if(incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or used")
      }
   
      const options={
         httpOnly: true,
         secure: true
      }
   
      const {newRefreshToken, newAccessToken}=await generateAccessAndRefreshTokens(user._id);
   
      return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken",newRefreshToken, options)
      .json(
         new ApiResponse(
            200,
            {
               accessToken: newAccessToken,
               refreshToken: newRefreshToken,
            },
            "Access token refresh"
         )
      )
   } catch (error) {
      throw new ApiError(500, error?.message || "Invalid refresh token")
   }


})

export {registerUser, loginUser, logoutUser, refreshAccessToken}