import { User } from "../models/user.model.js";
import { fileUpload } from "../utils/cloudinary.js";
import fs, { truncateSync } from "fs";
import { fileRemove } from "../utils/fileremove.js";

// ================= signup controller ======================
const signupController = async (req, res) => {
  const { userName, email, fullName, password } = req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  try {
    // data validation
    if (
      !userName?.trim() ||
      !email?.trim() ||
      !fullName?.trim() ||
      !password?.trim()
    ) {
      return res.status(400).json({ message: "All fileds are required" });
    }

    if (!avatarLocalPath) {
      return res.status(400).json({
        message: "avatar must be required",
      });
    }

    // check database is user already exist or not
    const isUserExit = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (isUserExit) {
      fileRemove(avatarLocalPath)
      fileRemove(coverImageLocalPath)
      return res.status(409).json({
        message: "user already exist withe same email or username",
      });
    }

    const avatar = await fileUpload(avatarLocalPath);
    const coverImage = await fileUpload(coverImageLocalPath);

    if (!avatar) {
      return res.json({
        message:
          "an error accoured while uploading avatar please upload it again",
      });
    }

    const userData = {
      fullName,
      userName: userName.toLowerCase(),
      email,
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    };

    const userUpload = await User.create(userData);

    userUpload.password = undefined
    userUpload.refreshToken = undefined

    res.status(201).json({
      message: "User created successfully",
      data: userUpload,
    });
  } catch (err) {
    fileRemove(avatarLocalPath);
    fileRemove(coverImageLocalPath);
  }
};


// ================= login controller ======================
const loginController = async (req, res) => {
  const { userName, email, password } = req.body;

  // 1. Validate input
  if (!userName && !email) {
    return res.status(400).json({
      message: "Please enter username or email",
    });
  }

  if (!password?.trim()) {
    return res.status(400).json({
      message: "Please enter password",
    });
  }

  // 2. Find user
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // 3. Check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }

  // 4. Generate tokens
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // 5. Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // 6. Remove sensitive fields from response
  user.password = undefined;
  user.refreshToken = undefined;

  // 7. Send response
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "User logged in successfully",
      data: {
        user,
      },
    });
};

// ================= logout controller ======================
const logoutController = async (req, res) => {
  const userInfo = req.userInfo;

  await User.findByIdAndUpdate(userInfo._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "user logout successfully" });
};

//=================== Refresh access token ====================

const refreshTokenController = async (req, res) => {
  try {
    const incommingRefreshToken = req.cookies.refreshToken;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    const options = {
      httpOnly : true,
      secure : true
    }

    res
      .status(200)
      .cookie("accessToken", newAccessToken , options)
      .cookie("refreshToken", newRefreshToken , options)
      .json({
        message: "access token refresh successfully",
      });


  } catch (error) {
   return  res.status(401).json({
      message: "somthing went wrong",
    });
  }
};

export {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
};
