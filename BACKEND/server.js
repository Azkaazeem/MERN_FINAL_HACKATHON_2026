const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const dns = require("dns");

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

// Connect Database
connectDB();

const app = express();

// Standard Middlewares (Increase payload limit to support Base64 Profile Pictures)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/uploadRoutes'));

// Health check route
app.get('/', (req, res) => {
  res.send('API is running smoothly...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});