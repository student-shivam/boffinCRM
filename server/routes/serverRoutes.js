const router = require('express').Router();
const { getServers, createServer, updateServer, deleteServer } = require('../controllers/serverController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getServers).post(protect, createServer);
router.route('/:id').put(protect, updateServer).delete(protect, deleteServer);

module.exports = router;
