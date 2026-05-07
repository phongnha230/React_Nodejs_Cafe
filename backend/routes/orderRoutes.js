const router = require('express').Router();
const authMW = require('../middleware/authMiddleware');
const oc = require('../controllers/orderController');
const allow = require('../middleware/roleMiddleware');
const { validateOrderCreation, validateId, validatePagination } = require('../middleware/validationMiddleware');

// List orders (with pagination and filtering)
router.get('/', authMW, allow('admin', 'customer'), validatePagination, oc.listOrders);

// Create order
router.post('/', authMW, allow('admin', 'customer'), validateOrderCreation, oc.createOrder);

// Create guest order via QR/table flow
router.post('/guest', validateOrderCreation, oc.createGuestOrder);

// Get order by id
router.get('/:id', authMW, allow('admin', 'customer'), validateId, oc.getOrderById);

// Update order status (admin only)
router.put('/:id/status', authMW, allow('admin'), validateId, oc.updateOrderStatus);

module.exports = router;
