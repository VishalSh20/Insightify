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


// routes
app.use("/api/v1/users",userRouter);

export {app};
