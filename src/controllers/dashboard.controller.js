import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanndler.js";


// controller for dashboard statictis
const getChannelStats = asyncHandler(async (req, res)=>{
    const channelStats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            totalLikes: {
                                $size: "$likes"
                            },
                            totalViews: {
                                $sum: "$videos.views"
                            }
                        }
                    },
                    {
                        $project: {
                            totalLikes: 1,
                            totalViews: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalSubscribers: {
                    $size: "$subscribers"
                },
                totalVideos: {
                    $size: "$videos"
                },
                totalLikes: {
                    $first: "$videos.totalLikes"
                },
                totalViews: {
                    $first: "$videos.totalViews"
                }
                
            }
        },
        {
            $project: {
                totalSubscribers: 1,
                totalVideos: 1,
                totalLikes: 1,
                totalViews: 1                
            }
        }
    ]);

    if(!channelStats){
        throw new ApiError(500, "Error while fetching the statictics")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channelStats, "Stats fetched successfully")
    )
});

// controller for getting all videos from the channel
const getAllVideos = asyncHandler(async (req, res)=>{
    const videos = await Video.find({
        owner: new mongoose.Types.ObjectId(req.user?._id)
    })

    if(videos?.length===0){
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "No videos found")
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "All Videos fetched successfully")
    )

});

export {
    getChannelStats,
    getAllVideos
}