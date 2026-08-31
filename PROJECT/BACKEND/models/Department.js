const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  onTimeRate: { type: Number, default: 95.0 },
  avgHours: { type: String, default: '3.0 hrs' },
  resolvedTotal: { type: Number, default: 500 },
  score: { type: Number, default: 90 },
  headOfficer: { type: String, default: 'Director General' },
  activeFleet: { type: String, default: '12 Units' }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
