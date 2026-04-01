const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  checklist: { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist', required: true },
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'compliant', 'non-compliant', 'in-progress', 'na'], default: 'pending' },
  remarks: { type: String },
  score: { type: Number, min: 0, max: 100 },
  reviewedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ResultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Result', ResultSchema);
