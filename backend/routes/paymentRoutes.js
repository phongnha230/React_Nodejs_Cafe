const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/paymentController');
const allow = require('../middleware/roleMiddleware');
const { validateId, validatePagination } = require('../middleware/validationMiddleware');

router.get('/', auth, allow('admin'), validatePagination, ctrl.list);
router.post('/', auth, allow('customer'), ctrl.create);
router.get('/:id', auth, allow('admin', 'customer'), validateId, ctrl.get);
router.put('/:id', auth, allow('admin', 'customer'), validateId, ctrl.update);
router.delete('/:id', auth, allow('admin'), validateId, ctrl.remove);

module.exports = router;

