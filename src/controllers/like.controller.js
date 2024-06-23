import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanndler.js";


// controller for the toggling the video like and unlike
const toggleVideoLike = asyncHandler(async (req, res)=>{
    const {videoId} = req.params;
    if(!videoId || videoId?.trim()===""){
        throw new ApiError(400, "Video id is not found");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "video not found");
    }

    const like = await Like.findOne({
        $and: [{likedBy: req.user?._id}, {video: videoId}]
    })

    if(!like){
        const likedVideo = await Like.create({
            likedBy: req.user?._id,
            video: videoId
        })

        if(!likedVideo){
            throw new ApiError(500, "Failed to like this video");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "successfully liked this video")
        )
    }
    else {
        const likedVideo = await Like.findOneAndDelete({
            $and: [{likedBy: req.user?._id}, {video: videoId}]
        })

        if(!likedVideo){
            throw new ApiError(500, "Failed to unlike the video")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideo, "Successfully unliked the video")
        )
    }
    
});

// controller for toggling the comments like
const toggleCommentLike = asyncHandler(async (req, res)=>{
    const {commentId} = req.params;
    if(!commentId || commentId?.trim()===""){
        throw new ApiError(400, "Comment id is not found");
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "comment not found");
    }

    const like = await Like.findOne({
        $and: [{likedBy: req.user?._id}, {comment: commentId}]
    })

    if(!like){
        const likedComment = await Like.create({
            likedBy: req.user?._id,
            comment: commentId
        })

        if(!likedComment){
            throw new ApiError(500, "Failed to like this comment");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedComment, "successfully liked this comment")
        )
    }
    else {
        const likedComment = await Like.findOneAndDelete({
            $and: [{likedBy: req.user?._id}, {comment: commentId}]
        })

        if(!likedComment){
            throw new ApiError(500, "Failed to unlike the comment")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedComment, "Successfully unliked the comment")
        )
    }
});

// controller for liking the tweet 
const toggleTweetLike = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params;
    if(!tweetId || tweetId?.trim()===""){
        throw new ApiError(400, "Tweet id is not found");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    const like = await Like.findOne({
        $and: [{likedBy: req.user?._id}, {tweet: tweetId}]
    })

    if(!like){
        const likedTweet = await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId
        })

        if(!likedTweet){
            throw new ApiError(500, "Failed to like this tweet");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedTweet, "successfully liked this tweet")
        )
    }
    else {
        const likedTweet = await Like.findOneAndDelete({
            $and: [{likedBy: req.user?._id}, {tweet: tweetId}]
        })

        if(!likedTweet){
            throw new ApiError(500, "Failed to unlike the tweet")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, likedTweet, "Successfully unliked the tweet")
        )
    }
});

// controller for geting all the liked video 
const getAllLikedVideo = asyncHandler(async (req, res)=>{
    const likedVideo = await Like.aggregate([
        {
            $match: {
                likedBy: req.user?._id,
                video: {$ne: null}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            owner: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoDetails: { 
                    $first: "$videoDetails"
                }
            }
        },
        {
            $project: {
                videoDetails: 1
            }
        }
    ]);

    if(!likedVideo) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "You have not liked video yet")
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideo, "All liked video fetched successfully")
    )
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideo
}