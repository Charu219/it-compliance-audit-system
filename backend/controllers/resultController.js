const Result = require('../models/Result');
const Checklist = require('../models/Checklist');

exports.createOrUpdateResult = async (req, res) => {
  try {
    const { checklistId, auditId, status, remarks, score } = req.body;
    
    // Also update the checklist status
    await Checklist.findByIdAndUpdate(checklistId, { status });

    const result = await Result.findOneAndUpdate(
      { checklist: checklistId, audit: auditId },
      { status, remarks, score, reviewedBy: req.user._id, reviewedAt: Date.now(), updatedAt: Date.now() },
      { new: true, upsert: true }
    ).populate('reviewedBy', 'name').populate('checklist', 'title');

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { auditId, checklistId } = req.query;
    let filter = {};
    if (auditId) filter.audit = auditId;
    if (checklistId) filter.checklist = checklistId;

    const results = await Result.find(filter)
      .populate('reviewedBy', 'name email')
      .populate('checklist', 'title category assignedDepartment priority')
      .sort({ updatedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getResultByChecklist = async (req, res) => {
  try {
    const result = await Result.findOne({ checklist: req.params.checklistId })
      .populate('reviewedBy', 'name');
    res.json(result || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
