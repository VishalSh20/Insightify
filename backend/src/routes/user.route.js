import {Router} from "express";
import { upload } from "../middlewares/multer.middleware.js";
import 
   {signupUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateUserDetails,
    changeCurrentPassword,
    getCurrentUser,
    changeAvatar,
    deleteCurrentUser} from "../controllers/user.controller.js"
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router();

router.route("/signup").post(upload.single("avatar",),signupUser);
router.route("/login").post(loginUser);
router.route("/logout").get(verifyAccessToken,logoutUser);
router.route("/refresh-token").get(refreshAccessToken);
router.route("/update-details").post(verifyAccessToken,updateUserDetails);
router.route("/change-password").patch(verifyAccessToken,changeCurrentPassword);
router.route("/change-avatar").patch(verifyAccessToken,upload.single("avatar"),changeAvatar);
router.route("/current-user").get(verifyAccessToken,getCurrentUser);
router.route("/delete-user").get(verifyAccessToken,deleteCurrentUser);


export default router;