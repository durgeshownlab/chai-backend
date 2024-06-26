import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanndler.js";
import { Subscription } from "../models/subscription.model.js";


// controller for dashboard statictis
const getChannelStats = asyncHandler(async (req, res)=>{
    const totalViewsAndVideos = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $unwind: {
                path: "$videos"
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$videos.views"
                },
                totalVideos: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                totalViews: 1,
                totalVideos: 1
            }
        }
    ]);

    const totalLikes = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $unwind: {
                path: "$videos"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "videos._id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $unwind: {
                path: "$likes"
            }
        },
        {
            $group: {
                _id: "_id",
                totalLikes: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                totalLikes: 1
            }
        }
    ]);

    const totalSubscriber = await Subscription.aggregate([
        {
            $match: {
                channel: req.user?._id
            }
        },
        {
            $group: {
                _id: "_id",
                totalSubscriber: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                totalSubscriber: 1
            }
        }
    ]);

    // console.log(totalViewsAndVideos, totalLikes, totalSubscriber)

    const channelStats = {
        totalViews: totalViewsAndVideos[0].totalViews,
        totalVideos: totalViewsAndVideos[0].totalVideos,
        totalLikes: totalLikes[0].totalLikes,
        totalSubscriber: totalSubscriber[0].totalSubscriber
    }


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