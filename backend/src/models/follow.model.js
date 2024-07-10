import mongoose,{Schema} from "mongoose";

const followSchema = new Schema({
    followBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    followTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});

export const Follow  = mongoose.model("Follow",followSchema);