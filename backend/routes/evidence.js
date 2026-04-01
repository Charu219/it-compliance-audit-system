const express = require('express');
const router = express.Router();
const { uploadEvidence, getEvidence, deleteEvidence } = require('../controllers/evidenceController');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, authorize('department'), upload.single('file'), uploadEvidence);
router.get('/', auth, getEvidence);
router.delete('/:id', auth, authorize('admin', 'department'), deleteEvidence);

module.exports = router;
