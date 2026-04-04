const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/reviewController');
const allow = require('../middleware/roleMiddleware');
const { validateReviewCreation, validateId, validatePagination } = require('../middleware/validationMiddleware');

router.get('/', ctrl.list);
router.post('/', auth, allow('admin', 'customer'), validateReviewCreation, ctrl.create);
router.get('/:id', auth, allow('admin', 'customer'), validateId, ctrl.get);
router.put('/:id', auth, allow('admin', 'customer'), validateId, validateReviewCreation, ctrl.update);
router.delete('/:id', auth, allow('admin'), validateId, ctrl.remove);

module.exports = router;

