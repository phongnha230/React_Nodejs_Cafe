const router = require('express').Router();
const authMW = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/voucherController');

router.get('/admin', authMW, allow('admin'), ctrl.adminList);
router.post('/admin', authMW, allow('admin'), ctrl.adminCreate);
router.put('/admin/:id', authMW, allow('admin'), ctrl.adminUpdate);
router.delete('/admin/:id', authMW, allow('admin'), ctrl.adminDelete);

router.get('/', authMW, allow('admin', 'customer'), ctrl.list);
router.get('/wallet', authMW, allow('admin', 'customer'), ctrl.wallet);
router.post('/:id/redeem', authMW, allow('admin', 'customer'), ctrl.redeem);

module.exports = router;
