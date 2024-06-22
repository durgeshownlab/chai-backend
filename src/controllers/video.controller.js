import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanndler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from 'fs'

// controller for fetching all the videos 
const getAllVideos = asyncHandler(async (req, res)=>{
    const {page=1, limit=10, query, sortBy, sortType, userId} = req.query;
    const allVideos = await Video.find({
        isPublished: true
    });

    if(!allVideos){
        throw new ApiError(404, "No videos found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, allVideos, "All videos fetched successfully")
    )
});

// controller for uploading the video 
const publishAVideo = asyncHandler(async (req, res)=>{
    // 1. get the title and description 
    // 2. validate this
    // 3. get the thumbnail and video file and validate this 
    // 4. upload the video and thumbnail on the cloudinary
    // 5. and save everything in database

    const {title, description} = req.body;
    if(!title || title?.trim()==="" || !description || description?.trim()==="") {
        throw new ApiError(404, "Title and description are required");
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    if(!videoFileLocalPath){
        throw new ApiError(400, "Video file is required");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // console.log("Local path: "+videoFileLocalPath, thumbnailLocalPath)

    if(!videoFile){
        throw new ApiError(400, "Error while uploading video");
    }
    if(!thumbnail){
        throw new ApiError(400, "Error while uploading the thumbnail");
    }

    const duration = videoFile?.duration;

    const uploadedVideo = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        owner: req.user?._id,
        title,
        description,
        duration
    });

    if(!uploadedVideo){
        throw new ApiError(500, "Error while uploading the video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, uploadedVideo, "Video uploaded successfully")
    )

});

// controller for fetching the video by id
const getVideoById = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    
    if(!videoId || videoId?.trim()===''){
        throw new ApiError(404, "Video id not found");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videoOwner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoOwner: {
                    $first: "$videoOwner"
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                videoOwner: 1
            }
        }
    ]);
    if(!video){
        throw new ApiError(404, "Video doesn't exist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    )

});

// controller for deleting the video by Id 
const deleteVideo = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    if(!videoId || videoId?.trim()===''){
        throw new ApiError(404, "Video id not found");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    if(String(video?.owner) !== String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if(!deleteVideo){
        throw new ApiError(500, "Error while deleting the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video deleted successfully")
    )
});

// controller for updating video 
const updateVideo = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    const {title, description} = req.body;
    console.log(videoId, title, description)
    if(!videoId || videoId?.trim()===''){
        throw new ApiError(404, "Video id not found");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video does not exist");
    }

    if(String(video?.owner) !== String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to update this video")
    }

    console.log(video)
    
    if(title && title?.trim()!==''){
        video.title = title;
    }

    if(description && description?.trim()!==''){
        video.description = description;
    }

    const thumbnailLocalPath = req.file?.path;
    console.log("Thubnail to upadate: "+thumbnailLocalPath)
    if(thumbnailLocalPath){
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(thumbnail){
            video.thumbnail = thumbnail.url;
        }
    }

    await video.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    )

});

//controller for updating the video publish status 
const updatePublishStatus = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    if(!videoId || videoId?.trim()==="" ){
        throw new ApiError(400, "Video Id not found");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }

    // console.log(String(video?.owner), String(req.user?._id))

    if(String(video.owner)!==String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to update the video");
    }

    video.isPublished = !video.isPublished;

    const savedVideo = await video.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new ApiResponse(200, savedVideo, `Video published status is turn to ${savedVideo.isPublished} successfully`)
    )

});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    deleteVideo,
    updateVideo,
    updatePublishStatus
}