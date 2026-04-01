const Checklist = require('../models/Checklist');
const Result = require('../models/Result');

exports.createChecklist = async (req, res) => {
  try {
    const item = await Checklist.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChecklists = async (req, res) => {
  try {
    const { auditId, department } = req.query;
    let filter = {};
    if (auditId) filter.audit = auditId;
    if (department) filter.assignedDepartment = department;
    if (req.user.role === 'department') filter.assignedDepartment = req.user.department;

    const items = await Checklist.find(filter).populate('audit', 'title status').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChecklistById = async (req, res) => {
  try {
    const item = await Checklist.findById(req.params.id).populate('audit', 'title status');
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    const item = await Checklist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Checklist item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Checklist item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkCreate = async (req, res) => {
  try {
    const { auditId, items } = req.body;
    const toCreate = items.map(item => ({ ...item, audit: auditId }));
    const created = await Checklist.insertMany(toCreate);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
