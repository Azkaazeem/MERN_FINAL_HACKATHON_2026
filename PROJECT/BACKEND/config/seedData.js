const mongoose = require('mongoose');
const Department = require('../models/Department');
const DistrictTelemetry = require('../models/DistrictTelemetry');
const AnalyticsStat = require('../models/AnalyticsStat');
const Complaint = require('../models/Complaint');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedInitialData = async () => {
  try {
    // 1. Seed Departments
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany([
        {
          name: 'Water Supply & Sewerage Board (WSSB)',
          code: 'WSSB',
          onTimeRate: 98.6,
          avgHours: '2.4 hrs',
          resolvedTotal: 1240,
          score: 99,
          headOfficer: 'Chief Engineer Tariq Mehmood',
          activeFleet: '14 Rapid Response Vans'
        },
        {
          name: 'Power & Grid Safety Board (Energy Corp)',
          code: 'POWER',
          onTimeRate: 97.4,
          avgHours: '1.2 hrs',
          resolvedTotal: 980,
          score: 96,
          headOfficer: 'Engr. Kamran Alvi',
          activeFleet: '8 Emergency Line Trucks'
        },
        {
          name: 'Solid Waste Management Authority (SWMA)',
          code: 'SWMA',
          onTimeRate: 96.1,
          avgHours: '3.1 hrs',
          resolvedTotal: 1450,
          score: 94,
          headOfficer: 'Director Zubair Haider',
          activeFleet: '22 Compact Garbage Trucks'
        },
        {
          name: 'Municipal Works & Asphalt Dept',
          code: 'WORKS',
          onTimeRate: 94.8,
          avgHours: '5.2 hrs',
          resolvedTotal: 890,
          score: 91,
          headOfficer: 'Engr. Farhan Lodhi',
          activeFleet: '6 Heavy Asphalt Rollers'
        }
      ]);
      console.log('[SEED] Municipal Departments seeded into Database.');
    }

    // 2. Seed District Telemetries
    const telemetryCount = await DistrictTelemetry.countDocuments();
    if (telemetryCount === 0) {
      await DistrictTelemetry.insertMany([
        {
          districtId: 'central',
          district: 'District Central',
          area: 'Nazimabad, Liaquatabad, Gulberg',
          lat: '24.9180° N',
          lng: '67.0315° E',
          active: 28,
          resolved: 194,
          risk: 'Medium',
          color: '#00e5ff',
          units: '6 Crew Teams',
          avgTime: '3.1 hrs',
          topIssue: 'Water Pipe Fractures'
        },
        {
          districtId: 'south',
          district: 'District South',
          area: 'Clifton, Saddar, Defense Corridor',
          lat: '24.8315° N',
          lng: '67.0344° E',
          active: 14,
          resolved: 240,
          risk: 'Low',
          color: '#10b981',
          units: '8 Crew Teams',
          avgTime: '2.2 hrs',
          topIssue: 'Traffic Light Sync'
        },
        {
          districtId: 'east',
          district: 'District East',
          area: 'Gulshan-e-Iqbal, Jamshed Town',
          lat: '24.9012° N',
          lng: '67.0855° E',
          active: 42,
          resolved: 165,
          risk: 'High',
          color: '#f59e0b',
          units: '5 Crew Teams',
          avgTime: '4.5 hrs',
          topIssue: 'Drainage Overflow'
        },
        {
          districtId: 'korangi',
          district: 'District Korangi',
          area: 'Korangi Industrial Area, Landhi',
          lat: '24.8150° N',
          lng: '67.1420° E',
          active: 35,
          resolved: 180,
          risk: 'High',
          color: '#ef4444',
          units: '7 Crew Teams',
          avgTime: '4.8 hrs',
          topIssue: 'High Voltage Wires'
        },
        {
          districtId: 'malir',
          district: 'District Malir',
          area: 'Malir Cantonment, Airport Axis',
          lat: '24.8960° N',
          lng: '67.2015° E',
          active: 19,
          resolved: 142,
          risk: 'Medium',
          color: '#00e5ff',
          units: '4 Crew Teams',
          avgTime: '3.6 hrs',
          topIssue: 'Street Lamp Repairs'
        }
      ]);
      console.log('[SEED] Karachi District Telemetry seeded into Database.');
    }

    // 3. Seed Analytics Benchmarks
    const analyticsCount = await AnalyticsStat.countDocuments();
    if (analyticsCount === 0) {
      await AnalyticsStat.create({
        metricKey: 'karachi_overall',
        meanResolutionHours: 3.42,
        medianResolutionHours: 2.10,
        stdDevHours: 1.18,
        iqrSpreadHours: 1.85,
        totalTicketsLogged: 1490,
        monthlyResolutionTrends: [
          { month: 'Jan', water: 4.2, roads: 8.5, waste: 3.1, power: 2.4 },
          { month: 'Feb', water: 3.8, roads: 7.2, waste: 2.8, power: 2.0 },
          { month: 'Mar', water: 3.4, roads: 6.5, waste: 2.5, power: 1.8 },
          { month: 'Apr', water: 3.0, roads: 5.8, waste: 2.2, power: 1.5 },
          { month: 'May', water: 2.6, roads: 5.1, waste: 1.9, power: 1.2 },
          { month: 'Jun', water: 2.1, roads: 4.4, waste: 1.6, power: 0.9 }
        ],
        categoryDistribution: [
          { name: 'Water & Sewerage', value: 420, color: '#00e5ff' },
          { name: 'Roads & Infrastructure', value: 360, color: '#3b82f6' },
          { name: 'Solid Waste & Sanitation', value: 480, color: '#10b981' },
          { name: 'Electrical & Fire Hazard', value: 230, color: '#f59e0b' }
        ]
      });
      console.log('[SEED] Analytics & Mathematical Telemetry seeded.');
    }

    // 4. Seed Initial Real Complaints
    const complaintCount = await Complaint.countDocuments();
    if (complaintCount === 0) {
      await Complaint.insertMany([
        {
          ticketId: '101',
          title: 'Main water pipeline burst with heavy street flooding',
          description: 'High-pressure water main fractured near block junction, inundating pedestrian sidewalks.',
          category: 'Water & Drainage',
          priority: 'Critical',
          status: 'In Progress',
          location: 'Central District (Nazimabad)',
          citizenName: 'Akash Ahmed',
          citizenEmail: 'akash@example.com',
          citizenContact: '0300-1122334',
          imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f8?w=500&auto=format&fit=crop&q=80',
          aiSummary: 'Critical underground potable water line rupture requiring immediate shutoff valve isolation.',
          department: 'Water Supply & Sewerage Board (WSSB)',
          assignedWorker: 'Officer Tariq Mehmood'
        },
        {
          ticketId: '102',
          title: 'Severe 2.5ft deep road pothole near primary school gate',
          description: 'Deep cave-in on main road posing severe hazard to school vans and motorcycle riders.',
          category: 'Roads & Infrastructure',
          priority: 'High',
          status: 'In Progress',
          location: 'District East (Gulshan-e-Iqbal)',
          citizenName: 'Sara Khan',
          citizenEmail: 'sara@example.com',
          citizenContact: '0312-9988776',
          imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=500&auto=format&fit=crop&q=80',
          aiSummary: 'Asphalt road surface collapse. Rapid cold-mix asphalt patch team dispatched.',
          department: 'Municipal Works Department',
          assignedWorker: 'Engr. Farhan Lodhi'
        },
        {
          ticketId: '103',
          title: 'Exposed high-voltage sparking transformer on utility pole',
          description: 'Continuous electrical arcing and loose hanging cable near residential market.',
          category: 'Electricity & Hazards',
          priority: 'Critical',
          status: 'Open',
          location: 'District South (Clifton)',
          citizenName: 'Hamza Tariq',
          citizenEmail: 'hamza@example.com',
          citizenContact: '0333-5566778',
          imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=80',
          aiSummary: 'High-voltage fire risk. Emergency grid feeder isolation requested.',
          department: 'Power & Grid Safety Board',
          assignedWorker: 'Engr. Kamran Alvi'
        },
        {
          ticketId: '104',
          title: 'Solid waste dump blocking stormwater drain outlet',
          description: 'Municipal trash bin overflowed and spilled into the main storm sewer channel.',
          category: 'Solid Waste & Bins',
          priority: 'Medium',
          status: 'Resolved',
          location: 'District Malir',
          citizenName: 'Ayesha Siddiqui',
          citizenEmail: 'ayesha@example.com',
          citizenContact: '0345-2233445',
          imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80',
          aiSummary: 'Sanitation team successfully cleared 3.5 tons of debris with hydraulic loader.',
          department: 'Solid Waste Management Authority (SWMA)',
          assignedWorker: 'Supervisor Zubair Haider',
          resolutionNotes: 'Debris completely cleared and dispatched to landfill. Drain flowing smoothly.',
          resolvedAt: new Date()
        }
      ]);
      console.log('[SEED] Initial Live Civic Complaints seeded into Database.');
    }

  } catch (err) {
    console.error('[SEED ERROR]:', err.message);
  }
};

module.exports = seedInitialData;
