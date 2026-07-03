import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constant.js";
const connectDB = async () => {
  dotenv.config();
  try {
    const connection = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`MongoDB connected successfully ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

export default connectDB;
