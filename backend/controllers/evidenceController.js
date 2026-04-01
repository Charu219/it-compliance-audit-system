const Evidence = require('../models/Evidence');
const path = require('path');
const fs = require('fs');

exports.uploadEvidence = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { checklistId, auditId, description } = req.body;
    const evidence = await Evidence.create({
      checklist: checklistId,
      audit: auditId,
      uploadedBy: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: `/uploads/${req.file.filename}`,
      description
    });
    const populated = await Evidence.findById(evidence._id).populate('uploadedBy', 'name department');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEvidence = async (req, res) => {
  try {
    const { checklistId, auditId } = req.query;
    let filter = {};
    if (checklistId) filter.checklist = checklistId;
    if (auditId) filter.audit = auditId;

    const evidence = await Evidence.find(filter)
      .populate('uploadedBy', 'name department')
      .populate('checklist', 'title')
      .sort({ uploadedAt: -1 });
    res.json(evidence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    if (!evidence) return res.status(404).json({ message: 'Evidence not found' });

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', evidence.fileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await Evidence.findByIdAndDelete(req.params.id);
    res.json({ message: 'Evidence deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
