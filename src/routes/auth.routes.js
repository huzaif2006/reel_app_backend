import { Router } from "express";
import { loginController, logoutController, signupController, refreshTokenController} from "../controllers/auth.contoller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRefreshToken } from "../middlewares/refreshToken.middleware.js";

export const authRoutes = Router();

authRoutes.post("/signup",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  signupController,
);


authRoutes.post("/login", loginController);


authRoutes.post("/logout", verifyJWT , logoutController)


authRoutes.post("/refresh-token" , verifyRefreshToken , refreshTokenController)

// authRoutes.route("/login").post(login)
