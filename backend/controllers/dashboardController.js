const Audit = require('../models/Audit');
const Checklist = require('../models/Checklist');
const User = require('../models/User');
const Evidence = require('../models/Evidence');
const Assignment = require('../models/Assignment');
const Result = require('../models/Result');

exports.getAdminDashboard = async (req, res) => {
  try {
    const [totalAudits, totalUsers, totalChecklist, totalEvidence] = await Promise.all([
      Audit.countDocuments(),
      User.countDocuments(),
      Checklist.countDocuments(),
      Evidence.countDocuments()
    ]);

    const auditsByStatus = await Audit.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const checklistByStatus = await Checklist.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const recentAudits = await Audit.find().populate('createdBy', 'name').sort({ createdAt: -1 }).limit(5);
    const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);

    const complianceRate = await Result.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: { totalAudits, totalUsers, totalChecklist, totalEvidence },
      auditsByStatus,
      checklistByStatus,
      recentAudits,
      usersByRole,
      complianceRate
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAuditorDashboard = async (req, res) => {
  try {
    const assignments = await Assignment.find({ auditor: req.user._id }).select('audit');
    const auditIds = assignments.map(a => a.audit);

    const [assignedAudits, pendingItems, completedItems] = await Promise.all([
      Audit.countDocuments({ _id: { $in: auditIds } }),
      Checklist.countDocuments({ audit: { $in: auditIds }, status: 'pending' }),
      Checklist.countDocuments({ audit: { $in: auditIds }, status: { $in: ['compliant', 'non-compliant'] } })
    ]);

    const recentAudits = await Audit.find({ _id: { $in: auditIds } }).sort({ createdAt: -1 }).limit(5);
    const checklistByStatus = await Checklist.aggregate([
      { $match: { audit: { $in: auditIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ stats: { assignedAudits, pendingItems, completedItems }, recentAudits, checklistByStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDepartmentDashboard = async (req, res) => {
  try {
    const dept = req.user.department;
    const [totalItems, pendingItems, compliantItems, evidenceUploaded] = await Promise.all([
      Checklist.countDocuments({ assignedDepartment: dept }),
      Checklist.countDocuments({ assignedDepartment: dept, status: 'pending' }),
      Checklist.countDocuments({ assignedDepartment: dept, status: 'compliant' }),
      Evidence.countDocuments({ uploadedBy: req.user._id })
    ]);

    const myItems = await Checklist.find({ assignedDepartment: dept })
      .populate('audit', 'title status').sort({ createdAt: -1 }).limit(5);
    const itemsByStatus = await Checklist.aggregate([
      { $match: { assignedDepartment: dept } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({ stats: { totalItems, pendingItems, compliantItems, evidenceUploaded }, myItems, itemsByStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
