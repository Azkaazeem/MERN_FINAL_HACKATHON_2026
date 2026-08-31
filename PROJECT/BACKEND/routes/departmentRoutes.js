const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ score: -1 });
    res.status(200).json({ success: true, count: departments.length, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch departments', error: err.message });
  }
});

module.exports = router;
