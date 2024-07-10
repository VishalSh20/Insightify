import { Router } from "express";
import {
    publishBlog,
    updateBlog,
    deleteBlog,
    changeCoverImage
} from "../controllers/blog.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";


const router = Router();
router.use(verifyAccessToken);

router.route("/").post(publishBlog);
router.route("/:blogId").patch(updateBlog).delete(deleteBlog);