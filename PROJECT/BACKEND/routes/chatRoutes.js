const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');

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
    const msg = new ChatMessage({
      ticketId: req.params.ticketId,
      senderRole: senderRole || 'customer',
      senderName: senderName || 'User',
      text: text || '',
      type: type || 'text',
      mediaUrl: mediaUrl || '',
      duration: duration || '',
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    const saved = await msg.save();
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
