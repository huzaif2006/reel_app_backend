import mongoose from "mongoose";

export  const connectDB = async () => {
  try {
    // MongoDB connection establish karna
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);

    console.log(
      `\n MongoDB connected successfully! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed error: ", error);
    process.exit(1); // Server process terminate karne ke liye
  }
};