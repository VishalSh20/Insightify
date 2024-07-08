import {Router} from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {loginUser, logoutUser, signupUser} from "../controllers/user.controller.js"
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(upload.single("avatar"),signupUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyAccessToken,logoutUser);

export default router;