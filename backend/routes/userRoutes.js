const router = require('express').Router();
const auth = require('../controllers/authController');
const userCtrl = require('../controllers/userController');
const authMW = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');
const { validateUserRegistration, validateUserLogin, validateId, validatePagination } = require('../middleware/validationMiddleware');

// Authentication routes với rate limiting
router.post('/register', authLimiter, validateUserRegistration, auth.register);
router.post('/login', authLimiter, validateUserLogin, auth.login);
router.get('/me', authMW, allow('admin', 'customer'), auth.me);

// User management routes (admin only)
router.get('/', authMW, allow('admin'), validatePagination, userCtrl.list);
router.get('/:id', authMW, allow('admin'), validateId, userCtrl.get);
router.put('/:id', authMW, allow('admin'), validateId, userCtrl.update);
router.delete('/:id', authMW, allow('admin'), validateId, userCtrl.remove);

module.exports = router;
