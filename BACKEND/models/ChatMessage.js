const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, index: true },
  senderRole: { type: String, enum: ['customer', 'worker', 'admin', 'system'], required: true },
  senderName: { type: String, required: true },
  text: { type: String, default: '' },
  type: { type: String, enum: ['text', 'voice', 'image', 'system'], default: 'text' },
  mediaUrl: { type: String, default: '' },
  duration: { type: String, default: '' },
  time: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
