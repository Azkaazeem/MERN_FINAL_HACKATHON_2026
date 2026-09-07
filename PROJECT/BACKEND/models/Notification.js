const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    default: ''
  },
  recipientRole: {
    type: String,
    enum: ['worker', 'customer', 'admin', 'administrator', 'user', 'agent'],
    default: 'worker'
  },
  type: {
    type: String,
    enum: [
      'ticket_created',
      'ticket_assigned',
      'worker_assigned',
      'status_updated',
      'ticket_resolved',
      'new_review',
      'ticket_deleted',
      'new_message',
      'general',
      'admin_alert'
    ],
    default: 'general'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  ticketId: {
    type: String,
    default: ''
  },
  senderName: {
    type: String,
    default: 'Citizen'
  },
  senderEmail: {
    type: String,
    default: ''
  },
  senderAvatar: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);