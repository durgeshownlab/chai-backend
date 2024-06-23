import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app=express();

// for configuring the server for cross origin resource sharing
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// for allowing out server to accept the json data 
app.use(express.json({
    limit: '16kb'
}))

// for url encoding
app.use(express.urlencoded({
    extended: true
}))

// for locating the public directory to acccess the files and images
app.use(express.static("public"))

// for confifuring the cookie parser in the server 
app.use(cookieParser())


// route import 
import userRouter from './routes/user.routes.js';
import healthcheckRouter from './routes/healthcheck.routes.js';
import tweetRoutes from './routes/tweet.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import videoRoutes from './routes/video.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from './routes/like.routes.js';
import playlistRoutes from './routes/playlist.routes.js';

//route decleration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/tweets", tweetRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/playlists", playlistRoutes);


export { app }