const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const ChatMessage = require('../models/ChatMessage');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Helper to find complaint by ticketId or ObjectId
async function findComplaintByTicket(ticketId) {
  if (!ticketId) return null;
  const cleanId = ticketId.toString().replace('#', '').trim();
  const cleanNum = cleanId.replace('TKT-', '');

  let complaint = null;
  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    complaint = await Complaint.findById(cleanId);
  }
  if (!complaint) {
    complaint = await Complaint.findOne({
      $or: [
        { ticketId: cleanId },
        { ticketId: `TKT-${cleanNum}` },
        { ticketId: cleanNum }
      ]
    });
  }
  return complaint;
}

// GET messages for a ticket (and automatically mark incoming messages as seen when viewer is active)
router.get('/:ticketId', async (req, res) => {
  try {
    const rawId = req.params.ticketId;
    const cleanId = rawId.toString().replace('#', '').trim();
    const cleanNum = cleanId.replace('TKT-', '');
    const readerRole = (req.query.readerRole || req.query.role || '').toLowerCase().trim();
    const readerName = (req.query.readerName || '').toLowerCase().trim();

    // When the other party reads/views the chat, mark messages from the sender as isRead: true
    if (readerRole || readerName) {
      try {
        let roleFilter = {};
        if (readerRole === 'worker' || readerRole === 'agent') {
          roleFilter = { senderRole: { $in: ['customer', 'user', 'citizen'] } };
        } else if (readerRole === 'customer' || readerRole === 'user') {
          roleFilter = { senderRole: { $in: ['worker', 'agent', 'officer', 'system'] } };
        } else if (readerName) {
          roleFilter = { senderName: { $ne: readerName } };
        }

        await ChatMessage.updateMany(
          {
            $or: [
              { ticketId: rawId },
              { ticketId: cleanId },
              { ticketId: `TKT-${cleanNum}` },
              { ticketId: cleanNum }
            ],
            ...roleFilter,
            isRead: { $ne: true }
          },
          { $set: { isRead: true, readAt: new Date() } }
        );
      } catch (markErr) {
        console.warn('Auto mark read error:', markErr.message);
      }
    }

    const messages = await ChatMessage.find({
      $or: [
        { ticketId: rawId },
        { ticketId: cleanId },
        { ticketId: `TKT-${cleanNum}` },
        { ticketId: cleanNum }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: err.message });
  }
});

// Explicit PUT mark read endpoint
router.put('/:ticketId/read', async (req, res) => {
  try {
    const rawId = req.params.ticketId;
    const cleanId = rawId.toString().replace('#', '').trim();
    const cleanNum = cleanId.replace('TKT-', '');
    const readerRole = (req.body.readerRole || req.query.readerRole || '').toLowerCase().trim();
    const readerName = (req.body.readerName || req.query.readerName || '').toLowerCase().trim();

    let roleFilter = {};
    if (readerRole === 'worker' || readerRole === 'agent') {
      roleFilter = { senderRole: { $in: ['customer', 'user', 'citizen'] } };
    } else if (readerRole === 'customer' || readerRole === 'user') {
      roleFilter = { senderRole: { $in: ['worker', 'agent', 'officer', 'system'] } };
    } else if (readerName) {
      roleFilter = { senderName: { $ne: readerName } };
    }

    await ChatMessage.updateMany(
      {
        $or: [
          { ticketId: rawId },
          { ticketId: cleanId },
          { ticketId: `TKT-${cleanNum}` },
          { ticketId: cleanNum }
        ],
        ...roleFilter,
        isRead: { $ne: true }
      },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark read', error: err.message });
  }
});

// POST message (supports /api/chat/send and /api/chat/:ticketId)
const handlePostMessage = async (req, res) => {
  try {
    const { 
      ticketId: bodyTicketId, 
      senderRole, 
      sender, 
      senderName, 
      senderAvatar, 
      text, 
      type, 
      mediaUrl, 
      imageUrl, 
      duration, 
      time 
    } = req.body;

    const rawTicketId = req.params.ticketId && req.params.ticketId !== 'send' ? req.params.ticketId : (bodyTicketId || '');
    if (!rawTicketId) {
      return res.status(400).json({ success: false, message: 'ticketId is required' });
    }

    const cleanTicketId = rawTicketId.toString().replace('#', '').trim();
    const role = (senderRole || sender || 'customer').toLowerCase();
    const name = senderName || (role === 'worker' ? 'Field Officer' : 'Citizen');
    const msgText = text || '';
    const media = mediaUrl || imageUrl || '';
    const msgType = type || (media ? 'image' : 'text');

    const msg = new ChatMessage({
      ticketId: cleanTicketId,
      senderRole: role,
      senderName: name,
      text: msgText,
      type: msgType,
      mediaUrl: media,
      duration: duration || '',
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    });
    const saved = await msg.save();

    // Trigger Notification for Recipient
    try {
      const complaint = await findComplaintByTicket(cleanTicketId);

      if (complaint) {
        if (role !== 'worker') {
          // Citizen sent message -> Find Worker & Notify
          let workerEmail = complaint.assignedWorkerEmail;
          if (!workerEmail && complaint.assignedWorkerId) {
            const w = await User.findById(complaint.assignedWorkerId);
            if (w?.email) workerEmail = w.email;
          }
          if (!workerEmail && complaint.assignedWorker && complaint.assignedWorker !== 'Unassigned') {
            const w = await User.findOne({ name: complaint.assignedWorker, role: { $in: ['worker', 'agent'] } });
            if (w?.email) workerEmail = w.email;
          }

          if (workerEmail) {
            await Notification.create({
              recipientEmail: workerEmail.toLowerCase().trim(),
              recipientRole: 'worker',
              type: 'new_message',
              title: '💬 New Message',
              message: `${name} msg u..`,
              ticketId: complaint.ticketId,
              senderName: name,
              senderEmail: complaint.citizenEmail || '',
              senderAvatar: senderAvatar || '',
              isRead: false
            });
          }
        } else {
          // Worker sent message -> Find Citizen & Notify
          let citizenEmail = complaint.citizenEmail;
          if (!citizenEmail && complaint.user) {
            const u = await User.findById(complaint.user);
            if (u?.email) citizenEmail = u.email;
          }

          if (citizenEmail) {
            await Notification.create({
              recipientEmail: citizenEmail.toLowerCase().trim(),
              recipientRole: 'customer',
              type: 'new_message',
              title: '💬 Field Officer Message',
              message: `${name} msg u..`,
              ticketId: complaint.ticketId,
              senderName: name,
              senderEmail: complaint.assignedWorkerEmail || '',
              senderAvatar: senderAvatar || '',
              isRead: false
            });
          }
        }
      }
    } catch (ne) {
      console.warn('Chat notification warning:', ne.message);
    }

    res.status(201).json({ success: true, message: saved });
  } catch (err) {
    console.error('Chat post error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message', error: err.message });
  }
};

router.post('/send', handlePostMessage);
router.post('/:ticketId', handlePostMessage);

// DELETE message endpoints
router.delete('/:ticketId/:messageId', async (req, res) => {
  try {
    const id = req.params.messageId || req.params.ticketId;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await ChatMessage.findByIdAndDelete(id);
    } else {
      await ChatMessage.deleteOne({ _id: id });
    }
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete message', error: err.message });
  }
});

router.delete('/:messageId', async (req, res) => {
  try {
    const id = req.params.messageId;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await ChatMessage.findByIdAndDelete(id);
    } else {
      await ChatMessage.deleteOne({ _id: id });
    }
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete message', error: err.message });
  }
});

module.exports = router;
