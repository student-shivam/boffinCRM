const router = require('express').Router();
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getBlogs).post(protect, createBlog);
router.route('/:id').get(protect, getBlog).put(protect, updateBlog).delete(protect, deleteBlog);

module.exports = router;
