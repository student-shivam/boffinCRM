const router = require('express').Router();
const { getTasks, getTask, createTask, updateTask, deleteTask, addComment } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getTasks).post(protect, createTask);
router.route('/:id').get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask);
router.post('/:id/comments', protect, addComment);

module.exports = router;
