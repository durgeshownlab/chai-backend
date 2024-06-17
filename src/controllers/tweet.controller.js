import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanndler.js";

// controller for create tweet 
const createTweet = asyncHandler(async (req, res)=>{
    const {content} = req.body;

    if(!content || content?.trim()==="") {
        throw new ApiError(404, "Content not found");
    }

    const tweet = await Tweet.create(
        {
            owner: req.user?._id,
            content
        }
    )

    if(!tweet) {
        throw new ApiError(500, "Error while creating the tweet")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    )

});

//controller for get the current user all tweets
const getTweets = asyncHandler(async (req, res)=>{
    const tweets = await Tweet.find(
        {
            owner: req.user?._id
        }
    )

    console.log(tweets)

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    )

});

// controller for get all tweets of a user
const getAllUserTweets = asyncHandler(async (req, res)=>{
    const {userId} = req.params;

    if(!userId || userId?.trim()===''){
        throw new ApiError(404, "User id not found");
    }

    const tweets = await Tweet.find(
        {
            owner: userId
        }
    )

    return res 
    .status(200)
    .json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    )

});

// controller for update tweet
const updateTweet = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params;
    const {content} = req.body;

    // console.log("Tweet ID "+req.params.tweetId)

    if(!tweetId || tweetId?.trim()==="") {
        throw new ApiError(404, "Tweet id not found");
    }

    if(!content || content?.trim()===""){
        throw new ApiError(404, "Content nor found")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(200, "No tweet found")
    }

    console.log("data : "+tweet.owner+" "+req.user?._id)

    if(String(tweet.owner)!==String(req.user?._id)) {
        throw new ApiError(401, "You are not authorized to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!updateTweet){
        throw new ApiError(500, updateTweet, "Failed to update the tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    )

});

// controller for delete the tweet 
const deleteTweet = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params;

    if(!tweetId || tweetId?.trim()===""){
        throw new ApiError(404, "Tweet id not found");
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if(String(tweet.owner)!==String(req.user?._id)){
        throw new ApiError(401, "You are not authorized to delete this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if(!deletedTweet){
        throw new ApiError(500, "Failed to delete the tweet")
    }

    console.log("Deleted tweet: "+deletedTweet)

    return res
    .status(200)
    .json(
        new ApiResponse(200, deleteTweet, "Tweet deleted successfully")
    )
    
});

export {
    createTweet,
    getAllUserTweets,
    updateTweet,
    deleteTweet,
    getTweets
}