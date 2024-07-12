import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const blogSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    coverImage:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    content:{
        type:String,
        required:true,
        trim:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    likesCount:{
        type:Number,
        default:0
    },
    tags:[
        {
            type:Schema.Types.ObjectId,
            ref:"Tag"
        }
    ],
    isPublished:{
        type:String,
        default:true
    }
},{timestamps:true});

blogSchema.plugin(mongooseAggregatePaginate);
export const Blog = mongoose.model("Blog",blogSchema);