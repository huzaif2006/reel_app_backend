import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { personalProfileController, publicUserProfileController } from "../controllers/user.controller.js"


const userRouter = express.Router()

userRouter.get("/personal-profile" , verifyJWT , personalProfileController)


userRouter.get("/user-profile/:username" , verifyJWT , publicUserProfileController)





export {userRouter}