const express = require('express');
const router = express.Router();
const { createChecklist, getChecklists, getChecklistById, updateChecklist, deleteChecklist, bulkCreate } = require('../controllers/checklistController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('admin'), createChecklist);
router.post('/bulk', auth, authorize('admin'), bulkCreate);
router.get('/', auth, getChecklists);
router.get('/:id', auth, getChecklistById);
router.put('/:id', auth, authorize('admin', 'auditor'), updateChecklist);
router.delete('/:id', auth, authorize('admin'), deleteChecklist);

module.exports = router;
