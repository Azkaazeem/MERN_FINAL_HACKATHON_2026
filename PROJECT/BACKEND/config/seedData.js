const mongoose = require('mongoose');
const Department = require('../models/Department');
const DistrictTelemetry = require('../models/DistrictTelemetry');
const AnalyticsStat = require('../models/AnalyticsStat');
const Complaint = require('../models/Complaint');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const seedInitialData = async () => {
  try {
    // 1. Explicitly create all collections so they are listed in MongoDB Atlas Data Explorer
    await User.createCollection().catch(() => {});
    await Complaint.createCollection().catch(() => {});
    await Department.createCollection().catch(() => {});
    await ChatMessage.createCollection().catch(() => {});
    await DistrictTelemetry.createCollection().catch(() => {});
    await AnalyticsStat.createCollection().catch(() => {});

    // 2. Seed Real Municipal Departments
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany([
        {
          name: 'Water Supply & Sewerage Board (WSSB)',
          code: 'WSSB',
          onTimeRate: 98.6,
          avgHours: '2.4 hrs',
          resolvedTotal: 0,
          score: 99,
          headOfficer: 'Chief Engineer Tariq Mehmood',
          activeFleet: '14 Rapid Response Vans'
        },
        {
          name: 'Power & Grid Safety Board (Energy Corp)',
          code: 'POWER',
          onTimeRate: 97.4,
          avgHours: '1.2 hrs',
          resolvedTotal: 0,
          score: 96,
          headOfficer: 'Engr. Kamran Alvi',
          activeFleet: '8 Emergency Line Trucks'
        },
        {
          name: 'Solid Waste Management Authority (SWMA)',
          code: 'SWMA',
          onTimeRate: 96.1,
          avgHours: '3.1 hrs',
          resolvedTotal: 0,
          score: 94,
          headOfficer: 'Director Zubair Haider',
          activeFleet: '22 Compact Garbage Trucks'
        },
        {
          name: 'Municipal Works & Asphalt Dept',
          code: 'WORKS',
          onTimeRate: 94.8,
          avgHours: '5.2 hrs',
          resolvedTotal: 0,
          score: 91,
          headOfficer: 'Engr. Farhan Lodhi',
          activeFleet: '6 Heavy Asphalt Rollers'
        }
      ]);
      console.log('[SEED] Municipal Departments seeded into Database.');
    }

    // 3. Clean up demo telemetry and analytics collections
    await DistrictTelemetry.deleteMany({});
    await AnalyticsStat.deleteMany({});
    
    // 4. Keep complaints empty - No demo complaints seeded
    await Complaint.deleteMany({
      $or: [
        { ticketId: { $in: ['101', '102', '103', '104', 'TKT-8942', 'TKT-8939', 'TKT-8931', 'TKT-8924'] } },
        { citizenEmail: { $in: ['akash@example.com', 'sara@example.com', 'hamza@example.com', 'ayesha@example.com'] } }
      ]
    });
    console.log('[SEED] All MongoDB Collections initialized & demo complaints cleared.');

  } catch (err) {
    console.error('[SEED ERROR]:', err.message);
  }
};

module.exports = seedInitialData;
