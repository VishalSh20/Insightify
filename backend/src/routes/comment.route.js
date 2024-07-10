import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyAccessToken} from "../middlewares/auth.middleware.js";
import { checkAvailability } from '../middlewares/availability.middleware.js';

const router = Router(); 

router.use(verifyAccessToken); // Apply verifyJWT middleware to all routes in this file

router.route("/:targetType/:targetId").get(getVideoComments).post(checkAvailability,addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router