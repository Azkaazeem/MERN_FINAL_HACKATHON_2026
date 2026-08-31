const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Configure reliable DNS servers for Windows Node.js SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server configuration fallback:', e.message);
}

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const LIVE_ATLAS_URI = 'mongodb+srv://azkaazeem804_db_user:KlHAmuaQuOjKfNbc@cluster1.n9chvof.mongodb.net/civic_support_db?retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || LIVE_ATLAS_URI;
  try {
    const conn = await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 8000 
    });
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Primary connection failed (${error.message}). Retrying with fallback Atlas cluster...`);
    try {
      const fallbackConn = await mongoose.connect(LIVE_ATLAS_URI, {
        serverSelectionTimeoutMS: 8000
      });
      console.log(`[MongoDB Atlas] Fallback cluster connected: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (e) {
      console.error('[MongoDB Error] Database connection failed completely:', e.message);
    }
  }
};

module.exports = connectDB;
