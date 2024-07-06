import mongoose,{Schema} from "mongoose";

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
    likes:{
        type:Number,
        default:0
    },
    comments:[
        {
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }
],
    tags:[
        {
            type:Schema.Types.ObjectId,
            ref:"Tag"
        }
    ]
},{timestamps:true});

export const Blog = mongoose.model("Blog",blogSchema);