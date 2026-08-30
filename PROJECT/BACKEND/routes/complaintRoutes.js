const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  trackComplaint,
  updateComplaintStatus,
  getComplaintStats
} = require('../controllers/complaintController');

router.post('/', createComplaint);
router.get('/', getAllComplaints);
router.get('/stats', getComplaintStats);
router.get('/track/:ticketId', trackComplaint);
router.put('/:id/status', updateComplaintStatus);

module.exports = router;
