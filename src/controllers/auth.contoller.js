import { User } from "../models/user.model.js";
import { fileUpload } from "../utils/cloudinary.js";
import fs, { truncateSync } from "fs";
import { fileRemove } from "../utils/fileremove.js";
import { error } from "console";

// ================= signup controller ======================
const signupController = async (req, res) => {
  const { userName, email, fullName, password , age } = req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  try {
    // data validation
    if (
      !userName?.trim() ||
      !email?.trim() ||
      !fullName?.trim() ||
      !password?.trim() ||
      !age?.trim()
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
      fileRemove(avatarLocalPath);
      fileRemove(coverImageLocalPath);
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
      age,
      password,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    };

    const userUpload = await User.create(userData);

    userUpload.password = undefined;
    userUpload.refreshToken = undefined;

    res.status(201).json({
      message: "User created successfully",
      data: userUpload,
    });
  } catch (err) {
    fileRemove(avatarLocalPath);
    fileRemove(coverImageLocalPath);

    return res.json({
      message : err.message
    })
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

//=================== Refresh access token controller ====================

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
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        message: "access token refresh successfully",
      });
  } catch (error) {
    return res.status(401).json({
      message: "somthing went wrong",
    });
  }
};

// ========================password change controller =============================
const passwordChangeController = async (req, res) => {
  try {
    const userInfo = req.userInfo;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "both old password and new password is required",
      });
    }

    const user = await User.findById(userInfo._id);

    const passwordCheck = await user.isPasswordCorrect(oldPassword);

    if (!passwordCheck) {
      return res.status(401).json({
        message: "Incorrect old password",
      });
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "password has changed successfully",
    });
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
};

// =======================update userInfo successfully==========================
const updateUserInfoController = async (req, res) => {
  try {
    const { fullName, email, userName , age } = req.body;

    if (!fullName && !email && !userName ,!age) {
      return res.status(400).json({
        message: "please enter something to update",
      });
    }

    const user = await User.findById(req.userInfo._id);

    const info = Object.entries(req.body); // this method will convert object into array

    info.forEach(([key, value]) => {
      if (value) {
        user[key] = value;
      }
    });

    await user.save();

    res.status(200).json({
      message: "user Information updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

// ======================update avatar controller ============================

const updateAvatarController = async (req, res) => {
  try {
    const localAvatarPath = req.file?.path;

    if (!localAvatarPath) {
      return res.status(400).json({
        message: "please upload avatar for update",
      });
    }

    const avatar = await fileUpload(localAvatarPath);

    if (!avatar) {
      return res.status(400).json({
        message: "something went wrong while uploading image ",
      });
    }

    const user = await User.findByIdAndUpdate( req.userInfo._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      {returnDocument: "after"},
    ).select("-password -refreshToken");


    return res.status(200).json({
      message : "avatar updated successfully",
      user : user
    })

  } catch (error) {
    return res.status(500).json({
      message : error.message
    })
  }
};



// ==============================update cover image====================================

const updateCoverImageController = async (req, res) => {
  try {
    const localCoverImagePath = req.file?.path;

    if (!localCoverImagePath) {
      return res.status(400).json({
        message: "please upload cover image for update",
      });
    }

    const coverImage = await fileUpload(localCoverImagePath);

    if (!coverImage) {
      return res.status(400).json({
        message: "something went wrong while uploading cover image ",
      });
    }

    const user = await User.findByIdAndUpdate( req.userInfo._id,
      {
        $set: {
          coverImage: coverImage.url,
        },
      },
      {returnDocument: "after"},
    ).select("-password -refreshToken");


    return res.status(200).json({
      message : "cover image updated successfully",
      user : user
    })

  } catch (error) {
    return res.status(500).json({
      message : error.message
    })
  }
};



// user profile controller




// export controllers 
export {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
  passwordChangeController,
  updateUserInfoController,
  updateAvatarController,
  updateCoverImageController
};
