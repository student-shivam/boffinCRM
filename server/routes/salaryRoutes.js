const router = require('express').Router();
const { getSalaries, generateSalaries, updateSalary, generateSalarySlip } = require('../controllers/salaryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSalaries);
router.post('/generate', protect, generateSalaries);
router.put('/:id', protect, updateSalary);
router.get('/:id/slip', protect, generateSalarySlip);

module.exports = router;
