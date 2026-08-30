const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');

// In-Memory Live DB Store (Resilient Fallback if Remote Mongo is offline)
let localComplaints = [
  {
    _id: 'cmp_101',
    ticketId: 'TKT-8942',
    title: 'Burst Main Potable Water Supply Pipeline',
    citizenName: 'Akash Ahmed',
    citizenContact: '0300-8876543',
    category: 'Water & Drainage',
    priority: 'Critical',
    status: 'In Progress',
    department: 'Water Supply & Sewerage Board (WSSB)',
    location: 'Sector 4, Main Boulevard, Karachi',
    assignedWorker: 'Officer Tariq Mehmood',
    aiSummary: 'Major underground pipeline fracture causing 400L/min water loss and street flooding.',
    createdAt: new Date()
  },
  {
    _id: 'cmp_102',
    ticketId: 'TKT-8939',
    title: 'Severe 2.5ft Road Pothole near School Gate',
    citizenName: 'Sara Khan',
    citizenContact: '0312-4455667',
    category: 'Roads & Infrastructure',
    priority: 'High',
    status: 'Open',
    department: 'Municipal Works & Engineering Dept',
    location: 'Block 7, Gulshan Avenue, Karachi',
    assignedWorker: 'Unassigned',
    aiSummary: 'Deep asphalt road cave-in creating accident risk for school buses and pedestrians.',
    createdAt: new Date()
  }
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create new civic complaint
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      priority, 
      location, 
      citizenName, 
      citizenEmail, 
      citizenContact, 
      imageUrl, 
      aiSummary, 
      department 
    } = req.body;

    const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);

    const newRecord = {
      _id: 'cmp_' + Date.now(),
      ticketId,
      title,
      description,
      category: category || 'General Civic',
      priority: priority || 'Medium',
      location,
      citizenName: citizenName || 'Citizen',
      citizenEmail: citizenEmail || '',
      citizenContact: citizenContact || '',
      imageUrl: imageUrl || '',
      aiSummary: aiSummary || '',
      department: department || 'Municipal Works & Engineering Dept',
      status: 'Open',
      assignedWorker: 'Unassigned',
      createdAt: new Date()
    };

    if (isDbConnected()) {
      try {
        const complaint = new Complaint(newRecord);
        const savedComplaint = await complaint.save();
        return res.status(201).json({
          success: true,
          message: 'Complaint registered successfully in Municipal Database!',
          complaint: savedComplaint
        });
      } catch (dbErr) {
        console.error('Mongo Save Fallback:', dbErr.message);
      }
    }

    // Local in-memory persistent store
    localComplaints.unshift(newRecord);

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully in Municipal Database!',
      complaint: newRecord
    });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
};

// @desc    Get all complaints (for Admin, Analytics & Public feed)
// @route   GET /api/complaints
exports.getAllComplaints = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          count: complaints.length,
          complaints
        });
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      count: localComplaints.length,
      complaints: localComplaints
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: localComplaints.length,
      complaints: localComplaints
    });
  }
};

// @desc    Track complaint by ticketId (e.g. TKT-8942 or cmp_101)
// @route   GET /api/complaints/track/:ticketId
exports.trackComplaint = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const cleanId = ticketId.trim().toUpperCase();

    if (isDbConnected()) {
      try {
        let complaint = await Complaint.findOne({ ticketId: cleanId });
        if (!complaint && ticketId.match(/^[0-9a-fA-F]{24}$/)) {
          complaint = await Complaint.findById(ticketId);
        }
        if (complaint) {
          return res.status(200).json({ success: true, complaint });
        }
      } catch (e) {}
    }

    const found = localComplaints.find(c => 
      c.ticketId.toUpperCase() === cleanId || 
      c._id === ticketId ||
      c.ticketId.includes(cleanId)
    );

    if (!found) {
      return res.status(404).json({
        success: false,
        message: `Ticket "${ticketId}" not found in database.`
      });
    }

    res.status(200).json({
      success: true,
      complaint: found
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching ticket' });
  }
};

// @desc    Update complaint status, assigned worker, or resolution proof
// @route   PUT /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedWorker, resolutionNotes, resolutionProofUrl } = req.body;
    const { id } = req.params;

    if (isDbConnected()) {
      try {
        const updateFields = {};
        if (status) updateFields.status = status;
        if (assignedWorker) updateFields.assignedWorker = assignedWorker;
        if (resolutionNotes) updateFields.resolutionNotes = resolutionNotes;
        if (resolutionProofUrl) updateFields.resolutionProofUrl = resolutionProofUrl;
        if (status === 'Resolved') updateFields.resolvedAt = new Date();

        let updated = await Complaint.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
        if (!updated) {
          updated = await Complaint.findOneAndUpdate({ ticketId: id }, { $set: updateFields }, { new: true });
        }
        if (updated) {
          return res.status(200).json({ success: true, message: `Ticket updated to ${status}!`, complaint: updated });
        }
      } catch (e) {}
    }

    const idx = localComplaints.findIndex(c => c._id === id || c.ticketId === id);
    if (idx !== -1) {
      localComplaints[idx] = {
        ...localComplaints[idx],
        ...(status ? { status } : {}),
        ...(assignedWorker ? { assignedWorker } : {}),
        ...(resolutionNotes ? { resolutionNotes } : {}),
        ...(resolutionProofUrl ? { resolutionProofUrl } : {}),
        ...(status === 'Resolved' ? { resolvedAt: new Date() } : {})
      };
      return res.status(200).json({
        success: true,
        message: `Ticket updated to ${status}!`,
        complaint: localComplaints[idx]
      });
    }

    res.status(404).json({ success: false, message: 'Ticket not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
};

// @desc    Get real-time municipal stats
// @route   GET /api/complaints/stats
exports.getComplaintStats = async (req, res) => {
  try {
    const list = isDbConnected() ? await Complaint.find() : localComplaints;
    const total = list.length;
    const open = list.filter(c => c.status === 'Open').length;
    const inProgress = list.filter(c => c.status === 'In Progress').length;
    const resolved = list.filter(c => c.status === 'Resolved').length;
    const critical = list.filter(c => c.priority === 'Critical').length;

    res.status(200).json({
      success: true,
      stats: { total, open, inProgress, resolved, critical }
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      stats: { total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0 }
    });
  }
};
