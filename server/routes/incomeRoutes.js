const router = require('express').Router();
const { getIncome, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getIncome).post(protect, createIncome);
router.route('/:id').put(protect, updateIncome).delete(protect, deleteIncome);

module.exports = router;
