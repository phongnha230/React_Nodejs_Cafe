/**
 * Order Controller
 * HTTP layer - handles requests and responses
 */

const orderService = require('../services/orderService');
const { success, error, created, paginated } = require('../utils/responseFormatter');
const logger = require('../config/logger');
const { appendGuestNote, normalizeGuestName } = require('../utils/guestOrder');
const { verifySignedTablePayload } = require('../utils/qrSignature');

/**
 * Create new order
 */
exports.createOrder = async (req, res) => {
  try {
    const { table_id, table_number, note, items } = req.body;

    const result = await orderService.createOrder(req.user.id, {
      table_id,
      table_number,
      note,
      items
    });

    res.status(201).json(created(result, 'Order created successfully'));
  } catch (err) {
    logger.error('Error creating order', {
      error: err.message,
      userId: req.user.id
    });

    if (err.message.includes('required') || err.message.includes('must')) {
      return res.status(400).json(error(err.message, 400));
    }

    res.status(500).json(error('Create order error', 500, err.message));
  }
};

/**
 * Create new guest order from QR/table flow
 */
exports.createGuestOrder = async (req, res) => {
  try {
    const { table_id, table_number, note, items, guest_name, payment_method, ts, sig } = req.body;

    verifySignedTablePayload(table_number, ts, sig);

    const guestName = normalizeGuestName(guest_name);
    const result = await orderService.createGuestOrder({
      table_id,
      table_number,
      note: appendGuestNote(note, guestName),
      items,
      payment_method: payment_method || 'cash',
      payment_status: 'pending'
    });

    res.status(201).json(created({
      ...result,
      guest_name: guestName
    }, 'Guest order created successfully'));
  } catch (err) {
    logger.error('Error creating guest order', {
      error: err.message,
      tableNumber: req.body?.table_number,
      tableId: req.body?.table_id
    });

    if (
      err.message.includes('required') ||
      err.message.includes('must') ||
      err.message.includes('not found') ||
      err.message.includes('not available') ||
      err.message.includes('inactive') ||
      err.message.includes('signature') ||
      err.message.includes('expired') ||
      err.message.includes('timestamp')
    ) {
      return res.status(400).json(error(err.message, 400));
    }

    res.status(500).json(error('Create guest order error', 500, err.message));
  }
};

/**
 * Get orders list
 */
exports.listOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;

    const result = await orderService.getOrders({
      userId: req.user.id,
      role: req.user.role,
      status,
      page,
      limit
    });

    res.json(paginated(
      result.orders,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    ));
  } catch (err) {
    logger.error('Error listing orders', {
      error: err.message,
      userId: req.user.id
    });

    res.status(500).json(error('List orders error', 500, err.message));
  }
};

/**
 * Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid order ID', 400));
    }

    const order = await orderService.getOrderById(id, req.user.id, req.user.role);
    res.json(success(order));
  } catch (err) {
    logger.error('Error getting order', {
      error: err.message,
      orderId: req.params.id,
      userId: req.user.id
    });

    if (err.message.includes('not found') || err.message.includes('access denied')) {
      return res.status(404).json(error(err.message, 404));
    }

    res.status(500).json(error('Get order error', 500, err.message));
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid order ID', 400));
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json(error('Status is required', 400));
    }

    const order = await orderService.updateOrderStatus(id, status, req.user.id);
    res.json(success(order, 'Order status updated successfully'));
  } catch (err) {
    logger.error('Error updating order status', {
      error: err.message,
      orderId: req.params.id,
      userId: req.user.id
    });

    if (err.message.includes('not found')) {
      return res.status(404).json(error(err.message, 404));
    }

    if (err.message.includes('Invalid') || err.message.includes('Cannot transition')) {
      return res.status(400).json(error(err.message, 400));
    }

    res.status(500).json(error('Update order status error', 500, err.message));
  }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json(error('Invalid order ID', 400));
    }

    const order = await orderService.cancelOrder(id, req.user.id, req.user.role);
    res.json(success(order, 'Order cancelled successfully'));
  } catch (err) {
    logger.error('Error cancelling order', {
      error: err.message,
      orderId: req.params.id,
      userId: req.user.id
    });

    if (err.message.includes('not found') || err.message.includes('access denied')) {
      return res.status(404).json(error(err.message, 404));
    }

    if (err.message.includes('Cannot cancel')) {
      return res.status(400).json(error(err.message, 400));
    }

    res.status(500).json(error('Cancel order error', 500, err.message));
  }
};

/**
 * Get order statistics
 */
exports.getStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    // If not admin, only show own stats
    if (req.user.role !== 'admin') {
      filters.userId = req.user.id;
    }

    const stats = await orderService.getOrderStatistics(filters);
    res.json(success(stats));
  } catch (err) {
    logger.error('Error getting order statistics', {
      error: err.message,
      userId: req.user.id
    });

    res.status(500).json(error('Get statistics error', 500, err.message));
  }
};
