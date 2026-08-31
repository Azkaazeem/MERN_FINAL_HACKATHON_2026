const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'civic_secret_jwt_key_2026_production', { expiresIn: '7d' });
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role, dob, department, profilePic } = req.body;
    const finalName = name || username;
    const cleanEmail = (email || '').trim().toLowerCase();

    const userExists = await User.findOne({ 
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
    });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const finalRole = role || (cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('worker') ? 'worker' : 'customer');

    const user = await User.create({ 
      name: finalName, 
      email: cleanEmail, 
      password, 
      role: finalRole,
      dob: dob || '',
      department: department || 'General Civic Support',
      profilePic: profilePic || '',
      karmaPoints: 150,
      verifiedReportsCount: 1,
      badge: 'Active Reporter'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        dob: user.dob,
        department: user.department,
        profilePic: user.profilePic,
        karmaPoints: user.karmaPoints,
        badge: user.badge
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${cleanEmail.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } 
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role || role || 'customer',
        dob: user.dob,
        department: user.department,
        profilePic: user.profilePic,
        karmaPoints: user.karmaPoints,
        badge: user.badge
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, dob, department, profilePic, password } = req.body;
    const userId = req.user?._id || req.body.userId;

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }

    if (!user && req.body.email) {
      user = await User.findOne({ email: req.body.email });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (dob) user.dob = dob;
    if (department) user.department = department;
    if (profilePic) user.profilePic = profilePic;
    if (password && password.length >= 6) {
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dob: user.dob,
        department: user.department,
        profilePic: user.profilePic,
        karmaPoints: user.karmaPoints,
        badge: user.badge
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
