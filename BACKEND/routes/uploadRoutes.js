const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;