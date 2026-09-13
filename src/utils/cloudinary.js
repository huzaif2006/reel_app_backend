import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import "dotenv/config"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function fileUpload(localFilePath) {
  try {
    if (!localFilePath) return null;

    const uploadedFile = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    return uploadedFile;
  } catch (err) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
    
  }
}
