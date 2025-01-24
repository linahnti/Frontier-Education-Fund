const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Wait for the connection to complete
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Now you can safely access conn.connection.host
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
