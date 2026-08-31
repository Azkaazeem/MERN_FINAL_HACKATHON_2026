const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Ensure .env is loaded regardless of execution cwd
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civic_db';
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to remote MongoDB (${error.message}). Running server with in-memory / local fallback mode.`);
  }
};

module.exports = connectDB;