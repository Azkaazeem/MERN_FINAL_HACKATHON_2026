const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getAllComplaints, 
  getMyComplaints,
  getComplaintStats,
  deleteComplaint,
  trackComplaint, 
  updateComplaintStatus, 
  getGisTelemetry,
  getMathematicalTelemetry,
  getWorkers,
  assignWorker,
  submitReview
} = require('../controllers/complaintController');

router.get('/workers', getWorkers);
router.get('/stats', getComplaintStats);
router.get('/my', getMyComplaints);
router.get('/telemetry/gis', getGisTelemetry);
router.get('/telemetry/math', getMathematicalTelemetry);
router.put('/:id/assign', assignWorker);
router.post('/:id/review', submitReview);
router.post('/', createComplaint);
router.get('/', getAllComplaints);
router.delete('/:id', deleteComplaint);
router.get('/track/:ticketId', trackComplaint);
router.put('/:id/status', updateComplaintStatus);

module.exports = router;
