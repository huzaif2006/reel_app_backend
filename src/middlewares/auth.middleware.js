import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken ||  req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        message: "unauthorized user",
      });
    }

    const userInfo = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!userInfo) {
      return res.status(401).json({
        message: "unautorized user",
      });
    }

    req.userInfo = userInfo;

    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message || "unauthorized user",
    });
  }
};
