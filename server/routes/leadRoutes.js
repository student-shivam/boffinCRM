const router = require('express').Router();
const { getLeads, getLead, createLead, updateLead, deleteLead, convertToClient } = require('../controllers/leadController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getLeads).post(protect, createLead);
router.route('/:id').get(protect, getLead).put(protect, updateLead).delete(protect, deleteLead);
router.post('/:id/convert', protect, convertToClient);

module.exports = router;
