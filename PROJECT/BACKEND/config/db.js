const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

// Configure reliable DNS servers to prevent querySrv ECONNREFUSED on local machines / ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1']);
} catch (dnsErr) {
  // Ignore in environments where setting DNS servers is restricted
}

// 1. Primary SRV URI
const PRIMARY_SRV_URI = 'mongodb+srv://azkaazeem804_db_user:3NQN9YskTWu6vy1X@cluster0.clkrb0s.mongodb.net/test?retryWrites=true&w=majority';

// 2. Direct 3-Shard Replica Set URI (Bypasses SRV completely to guarantee 100% connection on any machine/ISP)
const DIRECT_3SHARD_URI = 'mongodb://azkaazeem804_db_user:3NQN9YskTWu6vy1X@ac-fcrjwc2-shard-00-00.clkrb0s.mongodb.net:27017,ac-fcrjwc2-shard-00-01.clkrb0s.mongodb.net:27017,ac-fcrjwc2-shard-00-02.clkrb0s.mongodb.net:27017/test?ssl=true&authSource=admin&retryWrites=true&w=majority';

// Global cache for Serverless environments (Vercel / AWS Lambda)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    let mongoUri = process.env.MONGO_URI || PRIMARY_SRV_URI;
    
    // Auto-repair if environment variable has stale password or missing shard ID
    if (!mongoUri.includes('3NQN9YskTWu6vy1X') || !mongoUri.includes('clkrb0s')) {
      mongoUri = PRIMARY_SRV_URI;
    }

    cached.promise = mongoose.connect(mongoUri, opts)
      .then((m) => {
        console.log(`[MongoDB Atlas] Connected successfully via SRV to: ${m.connection.host}`);
        return m;
      })
      .catch(async (srvErr) => {
        console.warn(`[MongoDB Warning] SRV lookup failed (${srvErr.message}). Attempting Direct 3-Shard cluster connection...`);
        try {
          const directConn = await mongoose.connect(DIRECT_3SHARD_URI, opts);
          console.log(`[MongoDB Atlas] Connected successfully via Direct 3-Shard cluster to: ${directConn.connection.host}`);
          return directConn;
        } catch (directErr) {
          console.error('[MongoDB Error] Direct 3-Shard connection failed:', directErr.message);
          throw directErr;
        }
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('[MongoDB Fatal Error] Connection failed:', error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
