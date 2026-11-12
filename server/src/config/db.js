const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillbridge";
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};
