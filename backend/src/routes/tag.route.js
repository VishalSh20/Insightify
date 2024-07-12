import { Router } from "express";
import {getAllTags,addTags,deleteTag} from "../controllers/tag.controller.js";
import {verifyAccessToken} from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAccessToken);

router.route("/").get(getAllTags).post(addTags).delete(deleteTag);

export default router;


