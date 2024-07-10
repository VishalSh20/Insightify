import { Router } from 'express';
import {
    getLikedBlogs,
    getLikedVideos,
    toggleLike
} from "../controllers/like.controller.js"
import {verifyAccessToken} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyAccessToken); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/:targetType/:targetId").post(toggleLike);
router.route("/videos").get(getLikedVideos);
router.route("/blogs").get(getLikedBlogs);

export default router