import { Router } from "express";
import {
    publishBlog,
    updateBlog,
    deleteBlog,
    changeCoverImage,
    addTagToBlog,
    getBlogById,
    getAllBlogs
} from "../controllers/blog.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyAccessToken);

router.route("/").get(getAllBlogs).post(upload.single("coverImage"),publishBlog);
router.route("/:blogId").get(getBlogById).patch(updateBlog).delete(deleteBlog);
router.route("/:blogId/cover-image").patch(upload.single("coverImage"),changeCoverImage);
router.route("/:blogId/tags").patch(addTagToBlog);
export default router;