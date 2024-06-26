import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getAllUserTweets, getTweets, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT); // Apply jwt middleware to all routes in this file

// Tweet Routes
router.route("/").post(createTweet);
router.route("/").get(getTweets);
router.route("/user/:userId").get(getAllUserTweets);
router.route("/:tweetId").patch(updateTweet);
router.route("/:tweetId").delete(deleteTweet);
export default router;