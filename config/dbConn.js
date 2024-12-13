const mongoose = require('mongoose');

const connectDB = async (url) => {
  try{
    await mongoose.connect(url);
    console.log('MongoDB Connected...');
  } catch (err){
    console.log('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

module.exports = connectDB;