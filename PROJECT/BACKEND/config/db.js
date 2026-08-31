const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const DEFAULT_MONGO_URI = 'mongodb+srv://azkaazeem804_db_user:3NQN9YskTWu6vy1X@cluster0.clkrb0s.mongodb.net/test?retryWrites=true&w=majority';

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
    let mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
    
    // Auto-repair if Vercel Environment Variable is missing cluster shard id 'clkrb0s'
    if (mongoUri.includes('@cluster0.mongodb.net')) {
      mongoUri = mongoUri.replace('@cluster0.mongodb.net', '@cluster0.clkrb0s.mongodb.net');
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log(`[MongoDB Atlas] Connected successfully to host: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('[MongoDB Error] Connection failed:', error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
