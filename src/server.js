import express from "express";
import cookieParser from "cookie-parser";
import { authRoutes } from "./routes/auth.routes.js";
import { userRouter } from "./routes/user.routes.js";

export const app = express();

app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/auth" , authRoutes)

app.use("/api/v1/user", userRouter)


// not found route
app.use((req, res)=>{
    res.status(404).json({
        message : "api not found"
    })
})