const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("MongoDB connected successfully");
  return mongoose.connection;
};

module.exports = connectDB;
