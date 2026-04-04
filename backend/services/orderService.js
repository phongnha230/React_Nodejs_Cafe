/**
 * Order Service
 * Business logic for order operations
 */

const sequelize = require('../config/database');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Payment = require('../models/payment');
const Product = require('../models/product');
const { ORDER_STATUS, VALID_TRANSITIONS } = require('../constants/orderStatus');
const { calculateSubtotal } = require('../utils/priceCalculator');
const logger = require('../config/logger');

class OrderService {
    /**
     * Create new order
     * @param {number} userId - User ID
     * @param {object} orderData - Order data (table_number, note, items)
     * @returns {Promise<object>} Created order with items
     */
    async createOrder(userId, orderData) {
        const { table_number, note, items } = orderData;

        // Validate items
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Items array is required and must not be empty');
        }

        // Validate each item
        for (const item of items) {
            if (!item.product_id || !item.quantity || !item.unit_price) {
                throw new Error('Each item must have product_id, quantity, and unit_price');
            }
            if (item.quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }
        }

        // Start transaction
        const transaction = await sequelize.transaction();

        try {
            // Calculate total
            const totalAmount = calculateSubtotal(items);

            // Create order
            const order = await Order.create({
                user_id: userId,
                table_number: table_number || null,
                status: ORDER_STATUS.PENDING,
                note: note || null,
                total_amount: totalAmount
            }, { transaction });

            // Prepare order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.quantity * item.unit_price
            }));

            // Create order items
            await OrderItem.bulkCreate(orderItems, { transaction });

            // Commit transaction
            await transaction.commit();

            logger.info('Order created', {
                orderId: order.id,
                userId,
                totalAmount,
                itemsCount: items.length
            });

            return {
                order,
                items: orderItems
            };
        } catch (error) {
            await transaction.rollback();
            logger.error('Error creating order', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Get orders with filters
     * @param {object} filters - Filter options (userId, status, page, limit)
     * @returns {Promise<object>} Orders list with pagination
     */
    async getOrders(filters = {}) {
        const { userId, status, page = 1, limit = 10, role } = filters;
        const offset = (page - 1) * limit;

        const where = {};

        // If not admin, filter by user
        if (role !== 'admin' && userId) {
            where.user_id = userId;
        }

        // Filter by status
        if (status) {
            where.status = status;
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']],
            include: [
                { model: OrderItem, as: 'items' },
                { model: Payment, as: 'payments' }
            ]
        });

        return {
            orders: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get order by ID
     * @param {number} orderId - Order ID
     * @param {number} userId - User ID (for authorization)
     * @param {string} role - User role
     * @returns {Promise<object>} Order object
     */
    async getOrderById(orderId, userId, role) {
        const where = { id: orderId };

        // If not admin, check ownership
        if (role !== 'admin') {
            where.user_id = userId;
        }

        const order = await Order.findOne({
            where,
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: Payment, as: 'payments' }
            ]
        });

        if (!order) {
            throw new Error('Order not found or access denied');
        }

        return order;
    }

    /**
     * Update order status
     * @param {number} orderId - Order ID
     * @param {string} newStatus - New status
     * @param {number} userId - User ID (for logging)
     * @returns {Promise<object>} Updated order
     */
    async updateOrderStatus(orderId, newStatus, userId) {
        // Validate status
        if (!Object.values(ORDER_STATUS).includes(newStatus)) {
            throw new Error('Invalid order status');
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Check if transition is valid
        const currentStatus = order.status;
        const validTransitions = VALID_TRANSITIONS[currentStatus] || [];

        if (!validTransitions.includes(newStatus)) {
            throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
        }

        // Update status
        await order.update({ status: newStatus });

        logger.info('Order status updated', {
            orderId,
            oldStatus: currentStatus,
            newStatus,
            userId
        });

        return order;
    }

    /**
     * Cancel order
     * @param {number} orderId - Order ID
     * @param {number} userId - User ID
     * @param {string} role - User role
     * @returns {Promise<object>} Cancelled order
     */
    async cancelOrder(orderId, userId, role) {
        const order = await this.getOrderById(orderId, userId, role);

        // Check if order can be cancelled
        if (order.status === ORDER_STATUS.DELIVERED) {
            throw new Error('Cannot cancel delivered order');
        }

        if (order.status === ORDER_STATUS.CANCELLED) {
            throw new Error('Order is already cancelled');
        }

        // Update to cancelled
        await order.update({ status: ORDER_STATUS.CANCELLED });

        logger.info('Order cancelled', { orderId, userId });

        return order;
    }

    /**
     * Get order statistics
     * @param {object} filters - Filter options (startDate, endDate, userId)
     * @returns {Promise<object>} Order statistics
     */
    async getOrderStatistics(filters = {}) {
        const { startDate, endDate, userId } = filters;

        const where = {};

        if (userId) {
            where.user_id = userId;
        }

        if (startDate && endDate) {
            where.created_at = {
                [sequelize.Op.between]: [startDate, endDate]
            };
        }

        const orders = await Order.findAll({ where });

        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
            statusBreakdown: {},
            averageOrderValue: 0
        };

        // Calculate status breakdown
        orders.forEach(order => {
            stats.statusBreakdown[order.status] = (stats.statusBreakdown[order.status] || 0) + 1;
        });

        // Calculate average
        if (stats.totalOrders > 0) {
            stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
        }

        return stats;
    }
}

module.exports = new OrderService();
