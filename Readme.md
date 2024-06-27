# Dtube Api

This is Dtube Api. A small version of youtube this api has everything you want to do in platform like youtube.

So use this Api and make some cool project with your UI skills. And also don't forget to tag me on Linkedin given below.

## Note

If you want any other features to be there or if face any issue or want to address some bug or issue contact me via LinkedIn given below.

If you want to run this project offline make sure to add `.env` file in this for its varible refer `.envSample` file add all the value of given variable.

## Important Links

- Hosted URL [https://dtube-api.onrender.com/](https://dtube-api.onrender.com/)
- Postman Testing Api Documentation [https://documenter.getpostman.com/view/32327751/2sA3XWdz9t#0d7cb3d1-4fa1-4d7f-bf83-4632031c47f3](https://documenter.getpostman.com/view/32327751/2sA3XWdz9t#0d7cb3d1-4fa1-4d7f-bf83-4632031c47f3)
- Github Repo URL: [https://github.com/durgeshownlab/dtube-api](https://github.com/durgeshownlab/dtube-api)
- My LinkedIn: [https://www.linkedin.com/in/dev-durgesh/](https://www.linkedin.com/in/dev-durgesh/)

## Tech Stack Used

- *Programming Language*
  - Node.js
  - Express.js
  - MongoDB
- *Security and Authentication*
  - JWT (JSON Web Token)
  - Bcrypt.js (for hashing)
- *Library*
  - Multer (for file upload)
  - Mongoose (ODM - Object Data Modeling)
  - Mongoose-Aggregate-Paginate-V2 (for aggregation)
  - Cookie-Parser
  - Dot-Env
  - Cors
  - - For rest of the library refer package.json
- *Database*
  - MongoDB
- *Third Party Services*
  - Cloudinary (for image and video storage)

## Features and Endpoints

- User
  - Login
  - Register
  - Refresh token
  - Change password
  - Update account details
  - Update cover image
  - Update avatar image
  - Current user
  - Get history
  - Get channel profile of users
- Video
  - Upload Video
  - Delete Video
  - Edit Video
  - Fetch All Video
- Like
  - like a video
  - Like a Comment
  - Like a tweet
  - Get liked videos
- Comment
  - Post comment
  - Update comment
  - Delete Comment
- Subscription
  - Toggle Subscription
  - Get subscribed channel
  - Get channel subscriber of a user
- Playlist
  - Get playlist by id
  - Update playlist
  - Delete playlist
  - Add video to playlist
  - Remove video from playlist
  - Get all playlist of a user
- Tweet
  - Get tweets
  - Post a tweet
  - Update tweet
  - Delete tweet

- Dashboard
  - Get total subscribers count
  - Get total videos count
  - Get total likes count
  - Get total videos views count
