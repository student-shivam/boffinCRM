const router = require('express').Router();
const { getLeaves, createLeave, updateLeaveStatus, deleteLeave } = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getLeaves).post(protect, createLeave);
router.route('/:id').put(protect, updateLeaveStatus).delete(protect, deleteLeave);

module.exports = router;
