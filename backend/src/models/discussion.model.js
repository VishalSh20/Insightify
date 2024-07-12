import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
},{timestamps:true});

discussionSchema.plugin(mongooseAggregatePaginate);
export const Discussion = mongoose.model("Discussion",discussionSchema);