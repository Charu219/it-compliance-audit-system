const Assignment = require('../models/Assignment');

exports.createAssignment = async (req, res) => {
  try {
    const existing = await Assignment.findOne({ audit: req.body.audit, auditor: req.body.auditor });
    if (existing) {
      const updated = await Assignment.findByIdAndUpdate(existing._id, { ...req.body, assignedBy: req.user._id }, { new: true })
        .populate('auditor', 'name email').populate('audit', 'title');
      return res.json(updated);
    }
    const assignment = await Assignment.create({ ...req.body, assignedBy: req.user._id });
    const populated = await Assignment.findById(assignment._id).populate('auditor', 'name email').populate('audit', 'title');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { auditId } = req.query;
    let filter = {};
    if (auditId) filter.audit = auditId;
    if (req.user.role === 'auditor') filter.auditor = req.user._id;

    const assignments = await Assignment.find(filter)
      .populate('auditor', 'name email department')
      .populate('audit', 'title status')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
