const mongoose = require("mongoose");



const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.DB_CONNECT, {
      
    });
    console.log("Connect to DB");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};






module.exports = connectDB;
