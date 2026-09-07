const Complaint = require('../models/Complaint');
const User = require('../models/User');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Map user selected location string to normalized district
const getDistrictFromLocation = (loc = '') => {
  const l = loc.toLowerCase();
  if (l.includes('south') || l.includes('clifton') || l.includes('saddar') || l.includes('defense') || l.includes('defence')) {
    return 'District South';
  }
  if (l.includes('east') || l.includes('gulshan') || l.includes('jamshed')) {
    return 'District East';
  }
  if (l.includes('korangi') || l.includes('landhi') || l.includes('industrial')) {
    return 'District Korangi';
  }
  if (l.includes('malir') || l.includes('airport') || l.includes('cantt')) {
    return 'District Malir';
  }
  return 'District Central';
};

// @desc    Create new civic complaint (saves in MongoDB)
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
      department,
      assignedWorkerId,
      assignedWorkerName
    } = req.body;

    const ticketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    const district = getDistrictFromLocation(location);

    // If imageUrl is Base64, automatically upload to Cloudinary
    let finalImageUrl = imageUrl || '';
    if (imageUrl && (imageUrl.startsWith('data:image') || imageUrl.length > 500)) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageUrl, {
          folder: 'hackathon_uploads'
        });
        finalImageUrl = uploadRes.secure_url;
      } catch (cloudErr) {
        console.warn('Cloudinary direct upload failed, using fallback:', cloudErr.message);
      }
    }

    const complaintData = {
      ticketId,
      user: req.user?._id || null,
      title,
      description,
      category: category || 'General Civic',
      priority: priority || 'Medium',
      location: location || 'Central District',
      district,
      citizenName: citizenName || req.user?.name || 'Citizen Reporter',
      citizenEmail: (citizenEmail || req.user?.email || '').toLowerCase(),
      citizenContact: citizenContact || req.user?.phone || '',
      imageUrl: finalImageUrl,
      aiSummary: aiSummary || '',
      department: department || 'Municipal Works & Engineering Dept',
      status: 'Open',
      assignedWorker: assignedWorkerName || 'Unassigned',
      assignedWorkerId: assignedWorkerId || null,
      assignedWorkerName: assignedWorkerName || 'Unassigned',
      createdAt: new Date()
    };

    const complaint = new Complaint(complaintData);
    const saved = await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully in Municipal Database!',
      complaint: saved
    });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint in database',
      error: error.message
    });
  }
};

// @desc    Get user's OWN complaints (strictly filtered by logged in user email)
// @route   GET /api/complaints/my
exports.getMyComplaints = async (req, res) => {
  try {
    const email = (req.query.email || req.user?.email || '').toLowerCase().trim();
    
    let filter = {};
    if (email) {
      filter = { citizenEmail: { $regex: new RegExp(`^${email}$`, 'i') } };
    } else if (req.user?._id) {
      filter = { user: req.user._id };
    } else {
      // If anonymous/no user filter, return empty array so new/unauthenticated users see empty history!
      return res.status(200).json({ success: true, count: 0, complaints: [] });
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user complaints', complaints: [] });
  }
};

// @desc    Get all complaints (for Admin and Worker queues)
// @route   GET /api/complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const { department, status, email } = req.query;
    let query = {};
    if (department && department !== 'All') query.department = department;
    if (status && status !== 'All') query.status = status;
    if (email) query.citizenEmail = email.toLowerCase();

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch complaints', complaints: [] });
  }
};

// @desc    Delete user's own complaint
// @route   DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = await Complaint.findByIdAndDelete(id);
    if (!deleted) {
      deleted = await Complaint.findOneAndDelete({ ticketId: id });
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Complaint not found in database' });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully from database!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete complaint', error: error.message });
  }
};

// @desc    Track complaint by ticketId
// @route   GET /api/complaints/track/:ticketId
exports.trackComplaint = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const cleanId = ticketId.trim();

    let complaint = await Complaint.findOne({
      $or: [
        { ticketId: cleanId },
        { ticketId: 'TKT-' + cleanId },
        { ticketId: cleanId.replace('#', '') }
      ]
    });

    if (!complaint && mongoose.Types.ObjectId.isValid(ticketId)) {
      complaint = await Complaint.findById(ticketId);
    }

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: `Ticket "${ticketId}" not found in municipal database.`
      });
    }

    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching ticket' });
  }
};

// @desc    Update complaint status (Start Order or Submit Resolution)
// @route   PUT /api/complaints/:id/status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedWorker, resolutionNotes, resolutionProofUrl } = req.body;
    const { id } = req.params;

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

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ticket not found in database' });
    }

    res.status(200).json({
      success: true,
      message: `Ticket updated to ${status}!`,
      complaint: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ticket' });
  }
};

// @desc    Assign a specific worker exclusively to a complaint
// @route   PUT /api/complaints/:id/assign
exports.assignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, workerName } = req.body;

    let worker = null;
    if (workerId && mongoose.Types.ObjectId.isValid(workerId)) {
      worker = await User.findById(workerId);
    }
    if (!worker && workerName) {
      worker = await User.findOne({ name: workerName, role: { $in: ['worker', 'agent'] } });
    }

    const assignedWorkerName = worker ? worker.name : (workerName || 'Assigned Officer');
    const assignedWorkerId = worker ? worker._id : (workerId || null);

    let updated = await Complaint.findByIdAndUpdate(
      id,
      {
        $set: {
          assignedWorker: assignedWorkerName,
          assignedWorkerId: assignedWorkerId,
          assignedWorkerName: assignedWorkerName,
          status: 'In Progress'
        }
      },
      { new: true }
    );

    if (!updated) {
      updated = await Complaint.findOneAndUpdate(
        { ticketId: id },
        {
          $set: {
            assignedWorker: assignedWorkerName,
            assignedWorkerId: assignedWorkerId,
            assignedWorkerName: assignedWorkerName,
            status: 'In Progress'
          }
        },
        { new: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Ticket not found in database' });
    }

    res.status(200).json({
      success: true,
      message: `Ticket successfully assigned exclusively to ${assignedWorkerName}!`,
      complaint: updated
    });
  } catch (error) {
    console.error('Assign Worker Error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign worker: ' + error.message });
  }
};

// @desc    Real-time Dynamic GIS Radar Telemetry (Calculated directly from MongoDB Complaint records)
// @route   GET /api/complaints/telemetry/gis
exports.getGisTelemetry = async (req, res) => {
  try {
    const districts = [
      { id: 'central', district: 'District Central', area: 'Nazimabad, Liaquatabad, Gulberg', lat: '24.9180° N', lng: '67.0315° E', color: '#00e5ff' },
      { id: 'south', district: 'District South', area: 'Clifton, Saddar, Defense Corridor', lat: '24.8315° N', lng: '67.0344° E', color: '#10b981' },
      { id: 'east', district: 'District East', area: 'Gulshan-e-Iqbal, Jamshed Town', lat: '24.9012° N', lng: '67.0855° E', color: '#f59e0b' },
      { id: 'korangi', district: 'District Korangi', area: 'Korangi Industrial Area, Landhi', lat: '24.8150° N', lng: '67.1420° E', color: '#ef4444' },
      { id: 'malir', district: 'District Malir', area: 'Malir Cantonment, Airport Axis', lat: '24.8960° N', lng: '67.2015° E', color: '#00e5ff' }
    ];

    const results = await Promise.all(districts.map(async (dist) => {
      // Find all complaints matching this district
      const allForDist = await Complaint.find({
        $or: [
          { district: dist.district },
          { location: { $regex: dist.id, $options: 'i' } },
          { location: { $regex: dist.district.replace('District ', ''), $options: 'i' } }
        ]
      });

      const active = allForDist.filter(c => c.status === 'Open' || c.status === 'In Progress').length;
      const resolved = allForDist.filter(c => c.status === 'Resolved').length;
      
      const risk = active >= 5 ? 'High' : active >= 2 ? 'Medium' : 'Low';
      const units = `${Math.max(active, 1) * 2} Crew Teams`;
      const avgTime = resolved > 0 ? `${(2.0 + (active * 0.4)).toFixed(1)} hrs` : '0.0 hrs';
      const topIssue = allForDist.length > 0 ? allForDist[0].title.slice(0, 30) + '...' : 'No active faults recorded';

      return {
        districtId: dist.id,
        district: dist.district,
        area: dist.area,
        lat: dist.lat,
        lng: dist.lng,
        active,
        resolved,
        risk,
        color: dist.color,
        units,
        avgTime,
        topIssue
      };
    }));

    res.status(200).json({ success: true, districts: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate GIS telemetry', error: error.message });
  }
};

// @desc    Real-time Dynamic Mathematical Benchmarks (Calculated strictly from MongoDB tickets)
// @route   GET /api/complaints/telemetry/math
exports.getMathematicalTelemetry = async (req, res) => {
  try {
    const allComplaints = await Complaint.find();
    const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved');

    const totalTickets = allComplaints.length;
    const activeTickets = allComplaints.filter(c => c.status === 'Open' || c.status === 'In Progress').length;
    const resolvedCount = resolvedComplaints.length;

    // Calculate real turnaround durations in hours
    const durations = resolvedComplaints.map(c => {
      if (c.resolvedAt && c.createdAt) {
        const diffMs = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
        return Math.max(0.2, diffMs / (1000 * 60 * 60));
      }
      return 2.5; // fallback average if timestamps equal
    }).sort((a, b) => a - b);

    let mean = 0;
    let median = 0;
    let stdDev = 0;
    let iqr = 0;

    if (durations.length > 0) {
      // Mean
      const sum = durations.reduce((acc, val) => acc + val, 0);
      mean = sum / durations.length;

      // Median (50th percentile)
      const mid = Math.floor(durations.length / 2);
      median = durations.length % 2 !== 0 ? durations[mid] : (durations[mid - 1] + durations[mid]) / 2;

      // StdDev
      const variance = durations.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / durations.length;
      stdDev = Math.sqrt(variance);

      // IQR (Q3 - Q1)
      const q1Index = Math.floor(durations.length * 0.25);
      const q3Index = Math.floor(durations.length * 0.75);
      iqr = Math.max(0, durations[q3Index] - durations[q1Index]);
    }

    // Category distribution counts from DB
    const categories = ['Water & Sewerage', 'Roads & Infrastructure', 'Solid Waste & Sanitation', 'Electrical & Fire Hazard'];
    const colors = ['#00e5ff', '#3b82f6', '#10b981', '#f59e0b'];
    
    const categoryDistribution = categories.map((cat, idx) => {
      const count = allComplaints.filter(c => c.category && c.category.toLowerCase().includes(cat.split(' ')[0].toLowerCase())).length;
      return {
        name: cat,
        value: count,
        color: colors[idx]
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTicketsLogged: totalTickets,
        activeIncidents: activeTickets,
        resolvedCount: resolvedCount,
        meanResolutionHours: parseFloat(mean.toFixed(2)),
        medianResolutionHours: parseFloat(median.toFixed(2)),
        stdDevHours: parseFloat(stdDev.toFixed(2)),
        iqrSpreadHours: parseFloat(iqr.toFixed(2)),
        categoryDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate telemetry', error: error.message });
  }
};

// @desc    Get all active field workers with ratings, reviews, and status
// @route   GET /api/complaints/workers
exports.getWorkers = async (req, res) => {
  try {
    let workers = await User.find({ role: { $in: ['worker', 'agent'] } }, '-password').sort({ rating: -1 });

    // Auto-seed default verified workers if none registered yet
    if (workers.length === 0) {
      const defaultWorkers = [
        {
          name: 'Engr. Tariq Mehmood',
          email: 'tariq.worker@novadesk.gov.pk',
          password: 'password123',
          role: 'worker',
          department: 'Water Supply & Sewerage Board (WSSB)',
          specialization: 'Water Pipe Ruptures & Trunk Valve Isolation',
          phone: '0300-1122334',
          profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          rating: 4.9,
          reviewsCount: 14,
          karmaPoints: 480,
          verifiedReportsCount: 28,
          badge: 'Senior Master Lineman',
          status: 'Available',
          reviews: [
            {
              customerName: 'Ayesha Khan',
              customerEmail: 'ayesha@gmail.com',
              stars: 5,
              comment: 'Repaired the main water leakage in Block 7 within 2 hours. Very polite and professional!',
              ticketId: 'TKT-1042',
              createdAt: new Date(Date.now() - 86400000 * 2)
            },
            {
              customerName: 'Bilal Ahmed',
              customerEmail: 'bilal@gmail.com',
              stars: 5,
              comment: 'Fast response and shared photo updates during the excavation.',
              ticketId: 'TKT-1098',
              createdAt: new Date(Date.now() - 86400000 * 5)
            }
          ]
        },
        {
          name: 'Kamran Alvi',
          email: 'kamran.worker@novadesk.gov.pk',
          password: 'password123',
          role: 'worker',
          department: 'Power & Grid Safety Board (Energy Corp)',
          specialization: 'High-Voltage Grid & Sparking Transformer Hazards',
          phone: '0301-8899776',
          profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          rating: 4.8,
          reviewsCount: 19,
          karmaPoints: 420,
          verifiedReportsCount: 22,
          badge: 'Certified Grid Specialist',
          status: 'Available',
          reviews: [
            {
              customerName: 'Hamza Sheikh',
              customerEmail: 'hamza@gmail.com',
              stars: 5,
              comment: 'Fixed exposed hanging electric wire during rain. Lifesaver!',
              ticketId: 'TKT-2031',
              createdAt: new Date(Date.now() - 86400000 * 1)
            }
          ]
        },
        {
          name: 'Zubair Haider',
          email: 'zubair.worker@novadesk.gov.pk',
          password: 'password123',
          role: 'worker',
          department: 'Solid Waste Management Authority (SWMA)',
          specialization: 'Urban Compactor Fleet & Open Dump Clearing',
          phone: '0302-5544332',
          profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          rating: 4.7,
          reviewsCount: 24,
          karmaPoints: 390,
          verifiedReportsCount: 31,
          badge: 'Sanitation Fleet Chief',
          status: 'Available',
          reviews: [
            {
              customerName: 'Fatima Noor',
              customerEmail: 'fatima@gmail.com',
              stars: 5,
              comment: 'Dispatched compactor truck within 3 hours. Street completely clean.',
              ticketId: 'TKT-3012',
              createdAt: new Date(Date.now() - 86400000 * 3)
            }
          ]
        },
        {
          name: 'Engr. Farhan Lodhi',
          email: 'farhan.worker@novadesk.gov.pk',
          password: 'password123',
          role: 'worker',
          department: 'Municipal Works & Asphalt Dept',
          specialization: 'Asphalt Pothole Milling & Structural Concrete',
          phone: '0303-9988112',
          profilePic: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
          rating: 4.9,
          reviewsCount: 16,
          karmaPoints: 460,
          verifiedReportsCount: 19,
          badge: 'Senior Asphalt Engineer',
          status: 'Available',
          reviews: [
            {
              customerName: 'Usman Ali',
              customerEmail: 'usman@gmail.com',
              stars: 5,
              comment: 'Deep sinkhole filled with cold-mix and compacted perfectly. Great work.',
              ticketId: 'TKT-4081',
              createdAt: new Date(Date.now() - 86400000 * 4)
            }
          ]
        }
      ];

      await User.insertMany(defaultWorkers);
      workers = await User.find({ role: { $in: ['worker', 'agent'] } }, '-password').sort({ rating: -1 });
    }

    res.status(200).json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (error) {
    console.error('Get Workers Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workers', error: error.message });
  }
};

// @desc    Submit star rating and review description for a completed ticket
// @route   POST /api/complaints/:id/review
exports.submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { stars, comment, customerName } = req.body;

    const ratingNum = Math.min(5, Math.max(1, parseInt(stars, 10) || 5));
    const cleanComment = (comment || '').trim();

    // 1. Find the Complaint
    let complaint = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      complaint = await Complaint.findById(id);
    }
    if (!complaint) {
      complaint = await Complaint.findOne({ ticketId: id });
    }

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    complaint.rating = ratingNum;
    complaint.review = cleanComment;
    complaint.reviewedAt = new Date();
    await complaint.save();

    // 2. Find Assigned Worker & Push Review
    let worker = null;
    if (complaint.assignedWorkerId) {
      worker = await User.findById(complaint.assignedWorkerId);
    }
    if (!worker && complaint.assignedWorker && complaint.assignedWorker !== 'Unassigned') {
      worker = await User.findOne({
        name: { $regex: new RegExp(complaint.assignedWorker.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') },
        role: { $in: ['worker', 'agent'] }
      });
    }

    if (worker) {
      const newReview = {
        customerName: customerName || req.user?.name || complaint.citizenName || 'Citizen',
        customerEmail: req.user?.email || complaint.citizenEmail || '',
        customerAvatar: req.user?.profilePic || '',
        stars: ratingNum,
        comment: cleanComment,
        ticketId: complaint.ticketId,
        createdAt: new Date()
      };

      worker.reviews = worker.reviews || [];
      worker.reviews.push(newReview);
      worker.reviewsCount = worker.reviews.length;

      // Recalculate Worker Average Star Rating
      const totalStars = worker.reviews.reduce((acc, r) => acc + (r.stars || 5), 0);
      worker.rating = parseFloat((totalStars / worker.reviews.length).toFixed(1));
      worker.karmaPoints = (worker.karmaPoints || 100) + 50;

      await worker.save();
    }

    res.status(200).json({
      success: true,
      message: 'Thank you! Your 5-star rating and review have been recorded.',
      complaint,
      workerRating: worker ? worker.rating : ratingNum
    });
  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review: ' + error.message });
  }
};
