import mongoose,{mongo, Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const linkSchema = new Schema({
    label:{
        type:String,
        required:true,
        unique:true,
        enum:[
            "linkedin",
            "x","leetcode","codechef","codeforces","hashnode","website"
        ]
    },
    url:{
        type:String,
        required:true
    }
})

const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
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
    tagline:{
        type:String,
        maxLen:100
    },
    bio:{
        type:String,
        trim:true
    },
    avatar:{
        type:String,
        trim:true
    },
    links:[linkSchema],
    refreshToken:{
        type:String
    }
},{timestamps:true});

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    );

}

export const User = mongoose.model("User",userSchema);