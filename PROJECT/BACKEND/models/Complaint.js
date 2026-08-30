const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true,
    default: () => 'TKT-' + Math.floor(1000 + Math.random() * 9000)
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true
  },
  category: {
    type: String,
    default: 'General Civic'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  location: {
    type: String,
    required: [true, 'Location / Zone is required']
  },
  citizenName: {
    type: String,
    default: 'Anonymous Citizen'
  },
  citizenEmail: {
    type: String,
    default: ''
  },
  citizenContact: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  aiSummary: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: 'Municipal Works'
  },
  assignedWorker: {
    type: String,
    default: 'Unassigned'
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolutionProofUrl: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
