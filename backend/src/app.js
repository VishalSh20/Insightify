import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({credentials:true}));
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public/temp"));
app.use(cookieParser());

// routers
import userRouter from "./routes/user.route.js"
import videoRouter from "./routes/video.route.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import followRouter from "./routes/follow.route.js"
import blogRouter from "./routes/blog.route.js"
import discussionRouter from "./routes/discussion.route.js"
import healthcheckRouter from "./routes/healthcheck.route.js"
import tagRouter from "./routes/tag.route.js"

// routes
app.use("/api/v1/users",userRouter);
app.use("/api/v1/video",videoRouter);
app.use("/api/v1/comment",commentRouter);
app.use("/api/v1/like",likeRouter);
app.use("/api/v1/follow",followRouter);
app.use("/api/v1/blog",blogRouter);
app.use("/api/v1/discussion",discussionRouter);
app.use("/api/v1/tag",tagRouter);
app.use("/api/v1/healthcheck",healthcheckRouter);


export {app};
