const router = require('express').Router();
const { getDomains, createDomain, updateDomain, deleteDomain } = require('../controllers/domainController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getDomains).post(protect, createDomain);
router.route('/:id').put(protect, updateDomain).delete(protect, deleteDomain);

module.exports = router;
