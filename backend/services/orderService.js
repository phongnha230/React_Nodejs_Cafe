/**
 * Order Service
 * Business logic for order operations
 */

const sequelize = require('../config/database');
const { Op } = require('sequelize');
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Payment = require('../models/payment');
const Product = require('../models/product');
const Table = require('../models/table');
const { ORDER_STATUS, VALID_TRANSITIONS } = require('../constants/orderStatus');
const { calculateSubtotal } = require('../utils/priceCalculator');
const logger = require('../config/logger');

class OrderService {
    isTerminalStatus(status) {
        return [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(status);
    }

    async syncTableOccupancy(tableId, transaction = null) {
        if (!tableId) return;

        const activeOrders = await Order.count({
            where: {
                table_id: tableId,
                status: {
                    [Op.notIn]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED]
                }
            },
            transaction
        });

        await Table.update(
            { status: activeOrders > 0 ? 'occupied' : 'available' },
            {
                where: { id: tableId },
                transaction
            }
        );
    }

    /**
     * Create new order
     * @param {number} userId - User ID
     * @param {object} orderData - Order data (table_number, note, items)
     * @returns {Promise<object>} Created order with items
     */
    async createOrder(userId, orderData) {
        const { table_id, table_number, note, items } = orderData;

        // Validate items
        if (!Array.isArray(items) || items.length === 0) {
            throw new Error('Items array is required and must not be empty');
        }

        // Extract product IDs
        const productIds = items.map(item => item.product_id);
        
        // Fetch products from database to get official prices
        const products = await Product.findAll({
            where: { id: productIds }
        });

        // Create a map for quick lookup
        const productMap = {};
        products.forEach(p => {
            productMap[p.id] = p;
        });

        // Validate each item and calculate subtotal
        let totalAmount = 0;
        const validatedItems = [];
        let resolvedTable = null;

        if (table_id) {
            resolvedTable = await Table.findByPk(table_id);
            if (!resolvedTable) {
                throw new Error(`Table with ID ${table_id} not found`);
            }
        } else if (table_number) {
            resolvedTable = await Table.findOne({
                where: { table_number }
            });
            if (!resolvedTable) {
                throw new Error(`Table number ${table_number} not found`);
            }
        }

        if (resolvedTable && resolvedTable.status === 'inactive') {
            throw new Error(`Table ${resolvedTable.table_number} is inactive`);
        }

        if (resolvedTable && !['available', 'occupied'].includes(resolvedTable.status)) {
            throw new Error(`Table ${resolvedTable.table_number} is not available for ordering`);
        }

        for (const item of items) {
            const product = productMap[item.product_id];
            
            if (!product) {
                throw new Error(`Product with ID ${item.product_id} not found`);
            }
            
            if (!product.is_available) {
                throw new Error(`Product "${product.name}" is currently not available`);
            }

            if (!item.quantity || item.quantity <= 0) {
                throw new Error(`Invalid quantity for product "${product.name}"`);
            }

            const unitPrice = parseFloat(product.price);
            const subtotal = item.quantity * unitPrice;
            totalAmount += subtotal;

            validatedItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: unitPrice,
                subtotal: subtotal
            });
        }

        // Start transaction
        const transaction = await sequelize.transaction();

        try {
            // Create order
            const order = await Order.create({
                user_id: userId,
                table_id: resolvedTable?.id || null,
                table_number: resolvedTable?.table_number || table_number || null,
                status: ORDER_STATUS.PENDING,
                note: note || null,
                total_amount: totalAmount
            }, { transaction });

            // Prepare order items with order_id
            const orderItems = validatedItems.map(item => ({
                ...item,
                order_id: order.id
            }));

            // Create order items
            await OrderItem.bulkCreate(orderItems, { transaction });

            if (resolvedTable) {
                await this.syncTableOccupancy(resolvedTable.id, transaction);
            }

            // Commit transaction
            await transaction.commit();

            logger.info('Order created with validated prices', {
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
                { model: Payment, as: 'payments' },
                { model: Table, as: 'table' }
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
                { model: Payment, as: 'payments' },
                { model: Table, as: 'table' }
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

        const transaction = await sequelize.transaction();

        try {
            await order.update({ status: newStatus }, { transaction });

            const payment = await Payment.findOne({
                where: { order_id: order.id },
                transaction
            });

            if (newStatus === ORDER_STATUS.DELIVERED) {
                if (payment) {
                    if (!['completed', 'success'].includes(payment.status)) {
                        await payment.update({ status: 'completed' }, { transaction });
                    }
                } else {
                    await Payment.create({
                        order_id: order.id,
                        amount: parseFloat(order.total_amount),
                        method: 'cash',
                        status: 'completed'
                    }, { transaction });
                }
            }

            if (newStatus === ORDER_STATUS.CANCELLED && payment && payment.status === 'pending') {
                await payment.update({ status: 'failed' }, { transaction });
            }

            if (order.table_id && this.isTerminalStatus(newStatus)) {
                await this.syncTableOccupancy(order.table_id, transaction);
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

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

        const transaction = await sequelize.transaction();

        try {
            await order.update({ status: ORDER_STATUS.CANCELLED }, { transaction });

            if (order.table_id) {
                await this.syncTableOccupancy(order.table_id, transaction);
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

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

        const orders = await Order.findAll({ 
            where,
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ]
        });

        const stats = {
            totalOrders: orders.length,
            totalRevenue: 0, // Theoretical revenue (all orders)
            realRevenue: 0,  // Actual revenue (only delivered orders)
            statusBreakdown: {},
            topProducts: [],
            averageOrderValue: 0
        };

        const productSales = {};

        // Calculate statistics
        orders.forEach(order => {
            const amount = parseFloat(order.total_amount);
            stats.totalRevenue += amount;
            
            // Only count revenue for delivered orders
            if (order.status === ORDER_STATUS.DELIVERED) {
                stats.realRevenue += amount;
            }

            stats.statusBreakdown[order.status] = (stats.statusBreakdown[order.status] || 0) + 1;

            // Track product sales for top products
            if (order.items && order.status !== ORDER_STATUS.CANCELLED) {
                order.items.forEach(item => {
                    const productId = item.product_id;
                    const productName = item.product ? item.product.name : `Product #${productId}`;
                    
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            id: productId,
                            name: productName,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    
                    productSales[productId].quantity += item.quantity;
                    productSales[productId].revenue += parseFloat(item.subtotal);
                });
            }
        });

        // Sort and get top 5 products
        stats.topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Calculate average order value (based on successful orders)
        const successfulOrdersCount = stats.statusBreakdown[ORDER_STATUS.DELIVERED] || 0;
        if (successfulOrdersCount > 0) {
            stats.averageOrderValue = stats.realRevenue / successfulOrdersCount;
        }

        return stats;
    }
}

module.exports = new OrderService();
