import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "username must be required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "email must be required"],
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
    age :{
      type : Number,
      trim : true,
      required : [true, "age must be required"]
    },
    avatar: {
      type: String, // we will take it from cloudinary
      required: [true, "avatar must be required "],
    },
    coverImage: {
      type: String, // we will take it from cloudinary
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password must brequired"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

// this function will always run when the user collection will update or new create
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

});

// custom methods for specific collection

userSchema.methods.isPasswordCorrect = async function (password) {
  const passwordCheck = await bcrypt.compare(password, this.password);
  return passwordCheck;
};

userSchema.methods.generateAccessToken =  function () {
  const accessToken = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
  return accessToken
};

userSchema.methods.generateRefreshToken =  function () {
  const refreshToken = jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
  return refreshToken
};

export const User = mongoose.model("User", userSchema);
