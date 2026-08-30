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

// Standard Middlewares (Increase payload limit to support Base64 Profile Pictures)
app.use(cors());
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
app.listen(PORT, () => {
  console.log(`==========================================================`);
  console.log(`[INFO] Server listening on port ${PORT}`);
  console.log(`[INFO] API available at: http://localhost:${PORT}`);
  console.log(`==========================================================`);
});