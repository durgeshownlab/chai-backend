import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);

router.route("/:playlistId").get(getPlaylistById);
router.route("/:playlistId").patch(updatePlaylist);
router.route("/:playlistId").delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").delete(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylist);

export default router;