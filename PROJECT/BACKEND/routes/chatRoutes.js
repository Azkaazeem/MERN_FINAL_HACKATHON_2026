const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Complaint = require('../models/Complaint');

// GET all messages for a ticket
router.get('/:ticketId', async (req, res) => {
  try {
    const messages = await ChatMessage.find({ ticketId: req.params.ticketId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: err.message });
  }
});

// POST message to ticket
router.post('/:ticketId', async (req, res) => {
  try {
    const { senderRole, senderName, text, type, mediaUrl, duration, time } = req.body;
    const ticketId = req.params.ticketId;

    const msg = new ChatMessage({
      ticketId,
      senderRole: senderRole || 'customer',
      senderName: senderName || 'User',
      text: text || '',
      type: type || 'text',
      mediaUrl: mediaUrl || '',
      duration: duration || '',
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    const saved = await msg.save();

    // If worker sends message, automatically claim complaint for this worker in DB
    if (senderRole === 'worker' && senderName) {
      try {
        await Complaint.findOneAndUpdate(
          { $or: [{ ticketId: ticketId }, { _id: ticketId.match(/^[0-9a-fA-F]{24}$/) ? ticketId : null }] },
          { 
            assignedWorker: senderName,
            status: 'In Progress'
          }
        );
      } catch (dbErr) {
        console.warn('Complaint worker claim error:', dbErr.message);
      }
    }

    res.status(201).json({ success: true, message: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: err.message });
  }
});

// DELETE message
router.delete('/:ticketId/:messageId', async (req, res) => {
  try {
    await ChatMessage.findByIdAndDelete(req.params.messageId);
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete message', error: err.message });
  }
});

module.exports = router;
