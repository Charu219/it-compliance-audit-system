const express = require('express');
const router = express.Router();
const { getAdminDashboard, getAuditorDashboard, getDepartmentDashboard } = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

router.get('/admin', auth, authorize('admin'), getAdminDashboard);
router.get('/auditor', auth, authorize('auditor'), getAuditorDashboard);
router.get('/department', auth, authorize('department'), getDepartmentDashboard);

module.exports = router;
