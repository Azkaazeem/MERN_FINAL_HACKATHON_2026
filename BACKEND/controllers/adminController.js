const User = require('../models/User');

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (ONLY Super Admin admin@gmail.com can perform this)
exports.updateUserRole = async (req, res) => {
  try {
    // 1. Strict Check: ONLY admin@gmail.com can change roles
    if (req.user.email.toLowerCase() !== 'admin@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Super Admin (admin@gmail.com) is authorized to promote or demote user roles.'
      });
    }

    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role. Must be 'user' or 'admin'." });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    // 2. Strict Check: admin@gmail.com role can NEVER be changed!
    if (targetUser.email.toLowerCase() === 'admin@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'Super Admin Protected: The role of admin@gmail.com can NEVER be modified!'
      });
    }

    targetUser.role = role;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `Role for ${targetUser.name} (${targetUser.email}) successfully changed to ${role.toUpperCase()}.`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        authProvider: targetUser.authProvider,
        profilePic: targetUser.profilePic,
        createdAt: targetUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/users/:id
// @desc    Delete user account (ONLY Super Admin admin@gmail.com)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.email.toLowerCase() !== 'admin@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only Super Admin (admin@gmail.com) can delete accounts.'
      });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (targetUser.email.toLowerCase() === 'admin@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete Super Admin account!'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User ${targetUser.name} deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
