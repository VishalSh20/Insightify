import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLen:8
    },
    avatar:{
        type:String
    },
    blogs:[
        {
            type:Schema.Types.ObjectId,
            ref:"Blog"
        }
    ],
    videos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    discussions:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Discussion"
        }
    ],
    refreshToken:{
        type:String
    }
},{timestamps:true});

export const User = mongoose.model("User",userSchema);