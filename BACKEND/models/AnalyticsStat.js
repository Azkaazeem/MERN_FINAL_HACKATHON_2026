const mongoose = require('mongoose');

const analyticsStatSchema = new mongoose.Schema({
  metricKey: { type: String, required: true, unique: true, default: 'karachi_overall' },
  meanResolutionHours: { type: Number, default: 3.42 },
  medianResolutionHours: { type: Number, default: 2.10 },
  stdDevHours: { type: Number, default: 1.18 },
  iqrSpreadHours: { type: Number, default: 1.85 },
  totalTicketsLogged: { type: Number, default: 1490 },
  monthlyResolutionTrends: [{
    month: String,
    water: Number,
    roads: Number,
    waste: Number,
    power: Number
  }],
  categoryDistribution: [{
    name: String,
    value: Number,
    color: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsStat', analyticsStatSchema);
