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

const CLUSTER0_URI = 'mongodb+srv://azkaazeem804_db_user:KlHAmuaQuOjKfNbc@cluster0.clkrb0s.mongodb.net/test?retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || CLUSTER0_URI;
  try {
    const conn = await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 8000 
    });
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB Error] Database connection failed:', error.message);
    try {
      const fallbackConn = await mongoose.connect(CLUSTER0_URI, {
        serverSelectionTimeoutMS: 8000
      });
      console.log(`[MongoDB Atlas] Connected to Cluster0: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (e) {
      console.error('[MongoDB Error] Cluster0 connection retry failed:', e.message);
    }
  }
};

module.exports = connectDB;
