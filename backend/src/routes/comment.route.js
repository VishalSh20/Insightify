import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyAccessToken} from "../middlewares/auth.middleware.js";

const router = Router(); 

router.use(verifyAccessToken); // Apply verifyJWT middleware to all routes in this file

router.route("/:targetType/:targetId").get(getComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router