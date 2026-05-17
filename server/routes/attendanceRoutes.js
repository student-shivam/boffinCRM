const router = require('express').Router();
const { markAttendance, markBulkAttendance, getDailyAttendance, getMonthlyAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.post('/mark', protect, markAttendance);
router.post('/bulk', protect, markBulkAttendance);
router.get('/daily', protect, getDailyAttendance);
router.get('/monthly', protect, getMonthlyAttendance);

module.exports = router;
