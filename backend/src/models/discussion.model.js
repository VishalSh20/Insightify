import mongoose,{Schema} from "mongoose";



const discussionSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        required:true,
        trim:true,
        maxLen:200
    },
    content:{
        type:String,
        required:true,
        trim:true
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
]
,tags:[
    {
        type:Schema.Types.ObjectId,
        ref:"Tag"
    }
]
},{timestamps:true});

export const Discussion = mongoose.model("Discussion",discussionSchema);