import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanndler.js";


// controller for getting the list of channels that user has subscribed 
const getSubscribedChannels = asyncHandler(async (req, res)=>{
    const {subscriberId} = req.params;

    if(!subscriberId || subscriberId?.trim()===""){
        throw new ApiError(400, "channel not found");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }            
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                channelDetails: {
                    $first: "$channels"
                }
            }
        },
        {
            $project: {
                channelDetails: 1,
                channel: 1
            }
        }
        
    ]);

    console.log("Subscribed channels: "+subscribedChannels)

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannels, "subscribed channels fetched successfully")
    )

});

// controller for toggling the subscription
const toggleSubscription = asyncHandler(async (req, res)=>{
    const {channelId} = req.params;

    if(!channelId || channelId?.trim()===""){
        throw new ApiError(400, "channel not found")    
    }

    const isSubscribed = await Subscription.findOne({
        $and: [
            {
                subscriber: req.user?._id,
            },
            {
                channel: channelId,
            }
        ]
    });

    console.log("isSubscribed: "+isSubscribed)

    if(!isSubscribed){
        const subscribedChannel = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        if(!subscribedChannel){
            throw new ApiError(500, "unable to subscribe the channel")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannel, "channel subscribed successfully")
        )
    }

    const unsubscribedUser = await Subscription.findByIdAndDelete(
        isSubscribed?._id
    )

    if(!unsubscribedUser){
        throw new ApiError(500, "unable to unsubscribed channel")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, unsubscribedUser, "channel unsubscribed successfully")
    )

});

// controller for getting the list of subscriber that has subscribed the user
const getUserChannelSubscriber = asyncHandler(async (req, res)=>{
    const {channelId} = req.params;

    if(!channelId || channelId?.trim()===""){        
        throw new ApiError(400, "Channel id  not found")    
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriberDetails: {
                    $first: "$subscribers"
                }
            }
        },
        {
            $project: {
                subscriberDetails: 1,
                channel: 1
            }
        }
        
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "subscriber fetched successfully")
    )

});

export {
    getSubscribedChannels,
    toggleSubscription,
    getUserChannelSubscriber
}