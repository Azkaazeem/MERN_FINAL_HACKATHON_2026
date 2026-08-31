const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const User = require('./models/User');

// Load environment variables immediately at the very top
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const connectDB = require('./config/db');
const dns = require("dns");

dns.setServers(['8.8.8.8', '1.1.1.1']);

// Connect Database
connectDB();

const app = express();

// Allowed Frontend Origins (Production Vercel + Local Dev)
const allowedOrigins = [
  'https://mern-final-hackathon-2026-oqir.vercel.app',
  'https://mern-final-hackathon-2026.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

// CORS configuration supporting dynamic Vercel deployments and local development
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Standard Middlewares (Increase payload limit to support Base64 Profile Pictures)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));

// Admin User Management Routes
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', users: [] });
  }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.status(200).json({ success: true, message: 'Role updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.send('CivicAI Municipal API is running smoothly...');
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`==========================================================`);
    console.log(`[INFO] Server listening on port ${PORT}`);
    console.log(`[INFO] API available at: http://localhost:${PORT}`);
    console.log(`==========================================================`);
  });
}

module.exports = app;