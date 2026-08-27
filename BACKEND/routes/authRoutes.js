const express = require('express');
const router = express.Router();
const { register, login, googleAuth, githubAuth, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Local Auth Routes
router.post('/register', register);
router.post('/login', login);

// OAuth Routes
router.post('/google', googleAuth);
router.post('/github', githubAuth);

// Protected Profile Route
router.get('/me', protect, getMe);

module.exports = router;