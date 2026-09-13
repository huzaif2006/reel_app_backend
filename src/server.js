import express from "express";
import { authRoutes } from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/auth" , authRoutes)


// not found route
app.use((req, res)=>{
    res.status(404).json({
        message : "api not found"
    })
})