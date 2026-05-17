const router = require('express').Router();
const {
  getPayrolls,
  getPayrollById,
  generatePayrolls,
  updatePayroll,
  sendPayrollEmail,
  generatePayrollPdfSlip
} = require('../controllers/payrollController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPayrolls);
router.post('/generate', protect, generatePayrolls);
router.get('/:id', protect, getPayrollById);
router.put('/:id', protect, updatePayroll);
router.post('/send-email', protect, sendPayrollEmail);
router.get('/:id/slip', protect, generatePayrollPdfSlip);

module.exports = router;
