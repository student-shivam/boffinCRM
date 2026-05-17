const express = require('express');
const router = express.Router();
const {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} = require('../controllers/followupController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getFollowUps)
  .post(protect, createFollowUp);

router.route('/:id')
  .put(protect, updateFollowUp)
  .delete(protect, deleteFollowUp);

module.exports = router;
