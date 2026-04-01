const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, deleteAssignment } = require('../controllers/assignmentController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('admin'), createAssignment);
router.get('/', auth, getAssignments);
router.delete('/:id', auth, authorize('admin'), deleteAssignment);

module.exports = router;
