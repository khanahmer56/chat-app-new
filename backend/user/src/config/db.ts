import mongoose from "mongoose";

export const connectDB = async () => {
  const url = process.env.MONGO_URI;
  if (!url) throw new Error("MONGO_URI is not defined");
  try {
    const conn = await mongoose.connect(url);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};
