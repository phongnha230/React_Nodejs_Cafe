const router = require('express').Router();
const ctrl = require('../controllers/tableController');
const { validateId } = require('../middleware/validationMiddleware');

router.get('/', ctrl.listTables);
router.get('/:id', validateId, ctrl.getTableById);

module.exports = router;
