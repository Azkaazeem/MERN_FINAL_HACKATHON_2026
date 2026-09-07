const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  recipientRole: {
    type: String,
    enum: ['worker', 'customer', 'admin', 'administrator', 'user', 'agent'],
    default: 'worker'
  },
  type: {
    type: String,
    enum: ['ticket_assigned', 'new_message', 'ticket_resolved', 'new_review', 'general'],
    default: 'ticket_assigned'
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