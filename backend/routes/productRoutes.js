const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/productController');
const allow = require('../middleware/roleMiddleware');
const { validateProductCreation, validateId, validatePagination } = require('../middleware/validationMiddleware');

router.get('/', validatePagination, ctrl.list);
router.post('/', auth, allow('admin'), ctrl.uploadMedia, validateProductCreation, ctrl.create);
router.get('/:id', validateId, ctrl.get);
router.put('/:id', auth, allow('admin'), validateId, ctrl.uploadMedia, validateProductCreation, ctrl.update);
router.delete('/:id', auth, allow('admin'), validateId, ctrl.remove);

module.exports = router;
