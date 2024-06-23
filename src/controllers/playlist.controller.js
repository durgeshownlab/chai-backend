import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHanndler.js";


// controller for creating the playlist 
const createPlaylist = asyncHandler(async (req, res)=>{
    const {name, description} = req.body;

    if(!name || name?.trim()==="") {
        throw new ApiError(400, "Playlist name is required");
    }
    if(!description || description?.trim()===""){
        throw new ApiError(400, "Playlist description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    });

    if(!playlist){
        throw new ApiError(500, "Error while creating the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist is created successfully")
    )

});

// controller for getting playlist by id
const getPlaylistById = asyncHandler(async (req, res)=>{
    const {playlistId} = req.params;
    if(!playlistId || playlistId?.trim()===""){
        throw new ApiError(400, "Playlist id not found");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist doesn't exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )

});

// controller for updating the playlist 
const updatePlaylist = asyncHandler(async (req, res)=>{
    const {playlistId} = req.params;
    const {name, description} = req.body;

    if(!playlistId || playlistId?.trim()===""){
        throw new ApiError(400, "Playlist id not found")
    }
    
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist doesn't exist")   
    }

    if(String(playlist?.owner) !== String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to update the playlist")
    }

    if(name && name?.trim()!==""){
        playlist.name=name;
    }

    if(description && description?.trim()!==""){
        playlist.description=description;
    }

    const updatedPlaylist = await playlist.save();

    if(!updatedPlaylist){
        throw new ApiError(500, "Error while updating the playlist details")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    )

});

// controller for deleting the playlist
const deletePlaylist = asyncHandler(async (req, res)=>{
    const {playlistId} = req.params;

    if(!playlistId || playlistId?.trim()===""){
        throw new ApiError(400, "Playlist id not found")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist Doesn't exist");
    }
    if(String(playlist?.owner) !== String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to delete this playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if(!deletedPlaylist){
        throw new ApiError(500, "Error while deleting the playlist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
    )

});

// controller for adding video to the playlist
const addVideoToPlaylist = asyncHandler(async (req, res)=>{
    const {videoId, playlistId} = req.params;

    if(!playlistId || playlistId?.trim()===""){
        throw new ApiError(400, "Playlist id not found")
    }

    if(!videoId || videoId?.trim()===""){
        throw new ApiError(400, "Video id not found")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist doesn't exist")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video doesn't exist");
    }

    if(String(playlist?.owner) !== String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to add video to this playlist")
    }

    if(playlist?.video?.includes(videoId)){
        throw new ApiError(400, "Video is already in playlist")
    }

    playlist?.video?.push(videoId);

    const updatedPlaylist = await playlist.save();
    if(!updatedPlaylist){
        throw new ApiError(500, "Error while updating the video")
    } 

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Video added to the playlist successfully")
    )

});

// controller for deleting the video from the playlist 
const removeVideoFromPlaylist = asyncHandler(async (req, res)=>{
    const {videoId, playlistId} = req.params;

    if(!playlistId || playlistId?.trim()===""){
        throw new ApiError(400, "Playlist id not found")
    }

    if(!videoId || videoId?.trim()===""){
        throw new ApiError(400, "Video id not found")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist doesn't exist")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video doesn't exist");
    }

    if(String(playlist?.owner) !== String(req.user?._id)){
        throw new ApiError(403, "You are not authorized to add video to this playlist")
    }

    if(!playlist?.video?.includes(videoId)){
        throw new ApiError(404, "Video is not in playlist")
    }

    console.log("Video is in playlist: "+playlist?.video?.includes(videoId))

    playlist.video = playlist?.video.filter(item => String(item)!==String(videoId));

    console.log("video array: "+playlist.video)

    const updatedPlaylist = await playlist.save();
    if(!updatedPlaylist){
        throw new ApiError(500, "Error while deleting the video from playlist")
    } 

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Video removed from the playlist successfully")
    )
});

// controller for getting all the playlist of a specific user 
const getUserPlaylist = asyncHandler(async (req, res)=>{
    const {userId} = req.params;
    if(!userId || userId?.trim()===""){
        throw new ApiError(400, "User id not found")
    }
    
    const playlist = await Playlist.find(
        {
            owner: req.user?._id
        }
    )

    if(!playlist){
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "No playlist found")
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist fetched successfully")
    )
});

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylist
}