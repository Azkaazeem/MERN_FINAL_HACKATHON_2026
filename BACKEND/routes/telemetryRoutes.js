const express = require('express');
const router = express.Router();
const DistrictTelemetry = require('../models/DistrictTelemetry');

router.get('/', async (req, res) => {
  try {
    const districts = await DistrictTelemetry.find();
    res.status(200).json({ success: true, count: districts.length, districts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch telemetry', error: err.message });
  }
});

module.exports = router;
