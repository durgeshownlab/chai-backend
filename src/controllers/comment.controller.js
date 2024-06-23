import mongoose, { Schema } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHanndler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";


// controller for geting all the comments on specific video  
const getVideoComments = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    if(!videoId || videoId?.trim()==="") {
        throw new ApiError(400, "Video id not found");
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "commentedBy",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                commentedBy: {
                    $first: "$commentedBy"
                }
            }
        },
        {
            $project: {
                owner: 1,
                video: 1,
                content: 1,
                commentedBy: 1,
            }
        }
    ]);

    if(!comments || comments?.length===0){
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "No comment found")
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    )

});

// controller for posting comment on specific video 
const addComment = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    const {content} = req.body;

    if(!videoId || videoId?.trim()===""){
        throw new ApiError(400, "Video id not found");
    }

    if(!content || content?.trim()==="") {
        throw new ApiError(400, "content is not found");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video doesn't exist");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    });
    
    if (!comment) {
        throw new ApiError(500, "Error while posting the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment posted successfully")
    )

});

// controller for deleting comment 
const deleteComment = asyncHandler(async (req, res)=>{
    const {commentId} = req.params;

    if(!commentId || commentId?.trim()==="") {
        throw new ApiError(400, "comment id not found");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment doesn't exist");
    }

    if(String(comment?.owner) !== String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to delete other user's comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(500, "Error while deleting the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
    )

});

// controller for updating the comment 
const updateComment = asyncHandler(async (req, res)=>{
    const {commentId} = req.params;
    const {content} = req.body;

    if(!commentId || commentId?.trim()===""){
        throw new ApiError(400, "comment id not found");
    }
    if(!content || content?.trim()==="") {
        throw new ApiError(400, "content is not found");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "comment doesn't exist");
    }
    if(String(comment.owner)!==String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to update other user's comment")
    }

    comment.content = content;
    const updatedComment = await comment.save({validateBeforeSave: false});
    if(!updatedComment){
        throw new ApiError(500, "Error while updating the comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )

});

export {
    getVideoComments,
    addComment,
    deleteComment,
    updateComment
}