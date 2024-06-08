import mongoose, {Schema, Types} from "mongoose";
import jwt, { sign } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avtar: {
            type: String,  // coudinary url 
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            types: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }

);

userSchema.pre('save', async function(next){

    if(!this.isModified('password')) return next()

    this.password=bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPaaswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken=function(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.userName,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);

