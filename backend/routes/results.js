const express = require('express');
const router = express.Router();
const { createOrUpdateResult, getResults, getResultByChecklist } = require('../controllers/resultController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('auditor'), createOrUpdateResult);
router.get('/', auth, getResults);
router.get('/checklist/:checklistId', auth, getResultByChecklist);

module.exports = router;
