const router = require('express').Router();
const { getClients, getClient, createClient, updateClient, deleteClient, addNote, addPayment } = require('../controllers/clientController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getClients).post(protect, createClient);
router.route('/:id').get(protect, getClient).put(protect, updateClient).delete(protect, deleteClient);
router.post('/:id/notes', protect, addNote);
router.post('/:id/payments', protect, addPayment);

module.exports = router;
