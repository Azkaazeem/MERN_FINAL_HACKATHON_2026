const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Configure reliable DNS servers for SRV resolution (safe catch for Vercel)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const DEFAULT_MONGO_URI = 'mongodb+srv://azkaazeem804_db_user:3NQN9YskTWu6vy1X@cluster0.clkrb0s.mongodb.net/test?retryWrites=true&w=majority';

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 10000 
    });
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB Error] Database connection failed:', error.message);
  }
};

module.exports = connectDB;
