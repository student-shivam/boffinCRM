const router = require('express').Router();
const { getFinancialReport, exportExcel } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/financial', protect, getFinancialReport);
router.get('/export/:type', protect, exportExcel);

module.exports = router;
