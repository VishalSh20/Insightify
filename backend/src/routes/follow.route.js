import { Router } from 'express';

import {verifyAccessToken} from "../middlewares/auth.middleware.js"
import { getUserFollowers, getUserFollowings, toggleFollow } from '../controllers/follow.contoller.js';

const router = Router();
router.use(verifyAccessToken); // Apply verifyJWT middleware to all routes in this file

router.route("/u/:userId").get(getUserFollowers).post(toggleFollow);
router.route("/following/u/:userId").get(getUserFollowings);

export default router