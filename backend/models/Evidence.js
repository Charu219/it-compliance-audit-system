const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  checklist: { type: mongoose.Schema.Types.ObjectId, ref: 'Checklist', required: true },
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String },
  fileSize: { type: Number },
  filePath: { type: String, required: true },
  description: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evidence', EvidenceSchema);
