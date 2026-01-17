import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    console.log(`MongoDB connection successful at port ${process.env.PORT}`);
    console.log(
      `Connected to MongoDB: ${connectionInstance.connection.host}/${connectionInstance.connection.name}`
    );

  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
