const router = require('express').Router();
const { getAdminProfile, updateAdminProfile, changeAdminPassword } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);
router.put('/change-password', protect, changeAdminPassword);

module.exports = router;
