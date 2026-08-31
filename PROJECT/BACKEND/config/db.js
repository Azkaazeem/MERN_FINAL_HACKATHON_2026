const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const DEFAULT_ATLAS_URI = 'mongodb+srv://azkaazeem804_db_user:KlHAmuaQuOjKfNbc@cluster0.clkrb0s.mongodb.net/test?retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGOURI || DEFAULT_ATLAS_URI;
  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Atlas connection retry with default cluster: ${error.message}`);
    try {
      const fallbackConn = await mongoose.connect(DEFAULT_ATLAS_URI);
      console.log(`[MongoDB Atlas] Fallback connected: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (e) {
      console.error('[MongoDB Error] Database connection failed:', e.message);
    }
  }
};

module.exports = connectDB;
