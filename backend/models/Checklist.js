const mongoose = require('mongoose');

const ChecklistSchema = new mongoose.Schema({
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  assignedDepartment: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['pending', 'compliant', 'non-compliant', 'in-progress', 'na'], default: 'pending' },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Checklist', ChecklistSchema);
