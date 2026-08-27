const express = require('express');
const router = express.Router();
const { register, login, googleAuth, githubAuth, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Local Auth Routes
router.post('/register', register);
router.post('/login', login);

// OAuth Routes
router.post('/google', googleAuth);
router.post('/github', githubAuth);

// Protected Profile Routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;