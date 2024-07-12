import { Router } from "express";
import{
    createDiscussion,
    updateDiscussion,
    addTagToDiscussion,
    deleteDiscussion,
    getDiscussionById,
    getAllDiscussions
} from "../controllers/discussion.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAccessToken);

router.route("/").get(getAllDiscussions).post(createDiscussion);
router.route("/:discussionId").get(getDiscussionById).patch(updateDiscussion).delete(deleteDiscussion);
router.route("/:discussionId/tags").patch(addTagToDiscussion);
export default router;