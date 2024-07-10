import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        videoId: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        blogId: {
            type: Schema.Types.ObjectId,
            ref: "Blog"
        },
        discussionId:{
            type: Schema.Types.ObjectId,
            ref: "Discussion"
        },
        commentedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required:true
        }
    },
    {
        timestamps: true
    }
)


commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)