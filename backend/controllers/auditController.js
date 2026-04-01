const Audit = require('../models/Audit');
const Checklist = require('../models/Checklist');
const Assignment = require('../models/Assignment');

exports.createAudit = async (req, res) => {
  try {
    const audit = await Audit.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAudits = async (req, res) => {
  try {
    let audits;
    if (req.user.role === 'admin') {
      audits = await Audit.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
    } else if (req.user.role === 'auditor') {
      const assignments = await Assignment.find({ auditor: req.user._id }).select('audit');
      const auditIds = assignments.map(a => a.audit);
      audits = await Audit.find({ _id: { $in: auditIds } }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    } else {
      // department user
      const checklists = await Checklist.find({ assignedDepartment: req.user.department }).select('audit');
      const auditIds = [...new Set(checklists.map(c => c.audit.toString()))];
      audits = await Audit.find({ _id: { $in: auditIds } }).populate('createdBy', 'name email').sort({ createdAt: -1 });
    }
    res.json(audits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAuditById = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id).populate('createdBy', 'name email');
    if (!audit) return res.status(404).json({ message: 'Audit not found' });
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAudit = async (req, res) => {
  try {
    const audit = await Audit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!audit) return res.status(404).json({ message: 'Audit not found' });
    res.json(audit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAudit = async (req, res) => {
  try {
    await Audit.findByIdAndDelete(req.params.id);
    await Checklist.deleteMany({ audit: req.params.id });
    await Assignment.deleteMany({ audit: req.params.id });
    res.json({ message: 'Audit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
