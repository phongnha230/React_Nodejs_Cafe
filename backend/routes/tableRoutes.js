const router = require('express').Router();
const ctrl = require('../controllers/tableController');
const authMW = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');
const { validateId } = require('../middleware/validationMiddleware');

router.get('/', ctrl.listTables);
router.post('/', authMW, allow('admin'), ctrl.createTable);
router.get('/qr-links', authMW, allow('admin'), ctrl.getQrLinks);
router.get('/:id', validateId, ctrl.getTableById);
router.put('/:id', authMW, allow('admin'), validateId, ctrl.updateTable);
router.delete('/:id', authMW, allow('admin'), validateId, ctrl.deleteTable);

module.exports = router;
