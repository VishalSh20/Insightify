import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
        type:Boolean,
        default:true
    }
},
    {timestamps:true});


videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video",videoSchema);