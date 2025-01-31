const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Waiting for the connection to complete
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // safe access to conn.connection.host
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
