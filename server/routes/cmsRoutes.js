const router = require('express').Router();
const { getPages, getPage, createPage, updatePage, deletePage } = require('../controllers/cmsController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getPages).post(protect, createPage);
router.route('/:pageName').get(protect, getPage).put(protect, updatePage).delete(protect, deletePage);

module.exports = router;
