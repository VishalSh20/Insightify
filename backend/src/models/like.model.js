import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    blog:{
        type: Schema.Types.ObjectId,
        ref: "Blog"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    discussion: {
        type: Schema.Types.ObjectId,
        ref: "Discussion"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)