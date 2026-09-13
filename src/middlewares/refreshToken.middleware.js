import jwt from "jsonwebtoken";

export const verifyRefreshToken = (req, res, next) => {
  try {
    const incommingRefreshToken = req.cookies?.refreshToken;

    if (!incommingRefreshToken) {
      return res.status(401).json({
        message: "refresh token is required",
      });
    }

    const userInfo = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    if (!userInfo) {
      return res.status(400).json({
        message: "Invalid refresh token",
      });
    }

    req.userId = userInfo._id;

    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
