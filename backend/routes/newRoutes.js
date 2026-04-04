const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');

const controller = require('../controllers/newController');

// Public routes
router.get('/', controller.list);
router.get('/:id', controller.get);

// Protected routes (Admin only)
router.post('/', auth, allow('admin'), controller.uploadImage, controller.create);
router.put('/:id', auth, allow('admin'), controller.uploadImage, controller.update);
router.delete('/:id', auth, allow('admin'), controller.remove);

module.exports = router;

