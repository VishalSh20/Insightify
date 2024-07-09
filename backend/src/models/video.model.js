import mongoose,{Schema} from "mongoose";

const videoSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    thumbnail:{
        type:String,
        required:true,
        trim:true
    },
    videoFile:{
        type:String,
        required:true,
        trim:true
    },
    duration:{
        type:Number
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
    ],
    isPublished:{
        type:Boolean,
        default:true
    }
},
    {timestamps:true});

export const Video = mongoose.model("Video",videoSchema);