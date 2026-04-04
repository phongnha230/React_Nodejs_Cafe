const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notificationController');
const allow = require('../middleware/roleMiddleware');
const { validateId, validatePagination } = require('../middleware/validationMiddleware');

router.get('/', auth, allow(), validatePagination, ctrl.list);
router.post('/', auth, allow('admin'), ctrl.create);
router.get('/:id', auth, allow(), validateId, ctrl.get);
router.put('/:id', auth, allow('admin'), validateId, ctrl.update);
router.delete('/:id', auth, allow('admin'), validateId, ctrl.remove);

module.exports = router;

