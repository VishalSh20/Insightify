import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    blogId:{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    discussionId: {
        type: Schema.Types.ObjectId,
        ref: "Discussion"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)