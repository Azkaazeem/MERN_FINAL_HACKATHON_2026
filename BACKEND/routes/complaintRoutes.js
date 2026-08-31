const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getAllComplaints, 
  getMyComplaints,
  deleteComplaint,
  trackComplaint, 
  updateComplaintStatus, 
  getGisTelemetry,
  getMathematicalTelemetry
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getAllComplaints);
router.get('/my', getMyComplaints);
router.delete('/:id', deleteComplaint);
router.get('/track/:ticketId', trackComplaint);
router.put('/:id/status', updateComplaintStatus);
router.get('/telemetry/gis', getGisTelemetry);
router.get('/telemetry/math', getMathematicalTelemetry);

module.exports = router;
