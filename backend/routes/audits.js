const express = require('express');
const router = express.Router();
const { createAudit, getAudits, getAuditById, updateAudit, deleteAudit } = require('../controllers/auditController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('admin'), createAudit);
router.get('/', auth, getAudits);
router.get('/:id', auth, getAuditById);
router.put('/:id', auth, authorize('admin'), updateAudit);
router.delete('/:id', auth, authorize('admin'), deleteAudit);

module.exports = router;
