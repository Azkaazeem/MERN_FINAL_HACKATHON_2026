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

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[MongoDB Error] MONGO_URI is missing in .env file!');
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 8000 
    });
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB Error] Database connection failed:', error.message);
  }
};

module.exports = connectDB;
