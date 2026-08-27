const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: JWT TOKEN GENERATE FUNCTION
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hackathon_secret_key', { expiresIn: '7d' });
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, dob, cnic, profilePic } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      dob,
      cnic,
      profilePic,
      authProvider: 'local'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        cnic: user.cnic,
        profilePic: user.profilePic,
        role: user.role,
        authProvider: user.authProvider
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        cnic: user.cnic,
        profilePic: user.profilePic,
        role: user.role,
        authProvider: user.authProvider
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    let email, name, picture, googleId;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    } else if (accessToken) {
      const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      email = googleRes.data.email;
      name = googleRes.data.name;
      picture = googleRes.data.picture;
      googleId = googleRes.data.sub;
    } else {
      return res.status(400).json({ success: false, message: 'No Google credential provided' });
    }

    // Find or create user
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        authProvider: 'google',
        profilePic: picture || ''
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.profilePic && picture) user.profilePic = picture;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        cnic: user.cnic,
        profilePic: user.profilePic,
        role: user.role,
        authProvider: user.authProvider
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: 'Google Authentication failed: ' + error.message });
  }
};

// @route   POST /api/auth/github
exports.githubAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'GitHub code is required' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientSecret) {
      return res.status(400).json({
        success: false,
        message: 'GITHUB_CLIENT_SECRET is missing in backend .env'
      });
    }

    // Step 1: Exchange code for access_token with GitHub
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code
      },
      {
        headers: { 
          Accept: 'application/json',
          'User-Agent': 'MERN-Hackathon-App'
        }
      }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      console.error('GitHub token exchange failed:', tokenRes.data);
      return res.status(400).json({
        success: false,
        message: 'GitHub token error: ' + (tokenRes.data.error_description || tokenRes.data.error || 'Invalid code')
      });
    }

    // Step 2: Fetch user profile from GitHub API (User-Agent header is MANDATORY for GitHub API)
    const userRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'MERN-Hackathon-App'
      }
    });

    const githubUser = userRes.data;
    let email = githubUser.email;

    // If user's email is private on GitHub, fetch from /user/emails
    if (!email) {
      try {
        const emailRes = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'MERN-Hackathon-App'
          }
        });
        const primaryEmail = emailRes.data.find((e) => e.primary && e.verified) || emailRes.data[0];
        if (primaryEmail) {
          email = primaryEmail.email;
        }
      } catch (emailErr) {
        console.warn('Could not fetch GitHub private emails:', emailErr.message);
      }
    }

    if (!email) {
      email = `${githubUser.login}@github.com`;
    }

    // Step 3: Check if user exists in database
    const githubId = githubUser.id.toString();
    let user = await User.findOne({ $or: [{ email }, { githubId }] });

    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email,
        githubId,
        authProvider: 'github',
        profilePic: githubUser.avatar_url || ''
      });
    } else {
      if (!user.githubId) user.githubId = githubId;
      if (!user.profilePic && githubUser.avatar_url) user.profilePic = githubUser.avatar_url;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'GitHub login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        cnic: user.cnic,
        profilePic: user.profilePic,
        role: user.role,
        authProvider: user.authProvider
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('GitHub Auth Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'GitHub Authentication failed: ' + (error.response?.data?.message || error.message) 
    });
  }
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};