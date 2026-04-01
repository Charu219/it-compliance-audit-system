const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  framework: { type: String, enum: ['ISO 27001', 'SOC 2', 'HIPAA', 'GDPR', 'PCI DSS', 'NIST', 'Custom'], default: 'Custom' },
  status: { type: String, enum: ['draft', 'active', 'in-review', 'completed', 'archived'], default: 'draft' },
  startDate: { type: Date },
  endDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

AuditSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Audit', AuditSchema);
