const mongoose = require('mongoose');

const districtTelemetrySchema = new mongoose.Schema({
  districtId: { type: String, required: true, unique: true },
  district: { type: String, required: true },
  area: { type: String, required: true },
  lat: { type: String, required: true },
  lng: { type: String, required: true },
  active: { type: Number, default: 0 },
  resolved: { type: Number, default: 0 },
  risk: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  color: { type: String, default: '#00e5ff' },
  units: { type: String, default: '5 Crew Teams' },
  avgTime: { type: String, default: '3.2 hrs' },
  topIssue: { type: String, default: 'General Civic Maintenance' }
}, { timestamps: true });

module.exports = mongoose.model('DistrictTelemetry', districtTelemetrySchema);
