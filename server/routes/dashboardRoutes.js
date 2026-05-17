const router = require('express').Router();
const { getDashboardStats, getRecentActivities } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDashboardStats);
router.get('/activities', protect, getRecentActivities);

module.exports = router;
