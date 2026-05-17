const router = require('express').Router();
const { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getEmployees).post(protect, createEmployee);
router.route('/:id').get(protect, getEmployee).put(protect, updateEmployee).delete(protect, deleteEmployee);

module.exports = router;
