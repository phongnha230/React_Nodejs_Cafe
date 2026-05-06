/**
 * Payment Service
 * Business logic for payment operations
 */

const Payment = require('../models/payment');
const Order = require('../models/order');
const { PAYMENT_METHODS } = require('../constants/paymentMethods');
const logger = require('../config/logger');

class PaymentService {
    /**
     * Create new payment
     * @param {object} paymentData - Payment data
     * @returns {Promise<object>} Created payment
     */
    async createPayment(paymentData) {
        const { order_id, amount, method = PAYMENT_METHODS.CASH, status = 'pending', transaction_id } = paymentData;

        if (!order_id || typeof amount !== 'number') {
            throw new Error('Order ID and numeric amount are required');
        }

        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        const order = await Order.findByPk(order_id);
        if (!order) {
            throw new Error('Order not found');
        }

        if (!Object.values(PAYMENT_METHODS).includes(method)) {
            throw new Error('Invalid payment method');
        }

        const existingPayment = await Payment.findOne({ where: { order_id } });
        if (existingPayment) {
            throw new Error('Payment already exists for this order');
        }

        const payment = await Payment.create({
            order_id,
            amount,
            method,
            status,
            transaction_id: transaction_id || null
        });

        logger.info('Payment created', {
            paymentId: payment.id,
            orderId: order_id,
            amount,
            method
        });

        return payment;
    }

    async getAllPayments(options = {}) {
        const { orderId, status, page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const where = {};
        if (orderId) where.order_id = orderId;
        if (status) where.status = status;

        const { count, rows } = await Payment.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']],
            include: [{
                model: Order,
                as: 'order',
                required: false
            }]
        });

        return {
            payments: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    async getPaymentById(paymentId) {
        const payment = await Payment.findByPk(paymentId, {
            include: [{
                model: Order,
                as: 'order'
            }]
        });

        if (!payment) {
            throw new Error('Payment not found');
        }

        return payment;
    }

    async updatePayment(paymentId, updateData) {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            throw new Error('Payment not found');
        }

        const { amount, method, status, transaction_id } = updateData;

        if (typeof amount === 'number' && amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        if (method && !Object.values(PAYMENT_METHODS).includes(method)) {
            throw new Error('Invalid payment method');
        }

        await payment.update({
            amount: typeof amount === 'number' ? amount : payment.amount,
            method: method || payment.method,
            status: status || payment.status,
            transaction_id: transaction_id !== undefined ? transaction_id : payment.transaction_id
        });

        logger.info('Payment updated', { paymentId });

        return payment;
    }

    async updatePaymentStatus(paymentId, status) {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            throw new Error('Payment not found');
        }

        const validStatuses = ['pending', 'completed', 'success', 'failed', 'refunded'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid payment status');
        }

        await payment.update({ status });

        logger.info('Payment status updated', {
            paymentId,
            oldStatus: payment.status,
            newStatus: status
        });

        return payment;
    }

    async deletePayment(paymentId) {
        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            throw new Error('Payment not found');
        }

        if (payment.status === 'completed' || payment.status === 'success') {
            throw new Error('Cannot delete completed payment');
        }

        await payment.destroy();

        logger.info('Payment deleted', { paymentId });

        return true;
    }

    async getPaymentByOrderId(orderId) {
        return await Payment.findOne({
            where: { order_id: orderId }
        });
    }

    async getPaymentStatistics(filters = {}) {
        const { startDate, endDate } = filters;

        const where = {};

        if (startDate && endDate) {
            where.created_at = {
                [require('sequelize').Op.between]: [startDate, endDate]
            };
        }

        const payments = await Payment.findAll({ where });

        const stats = {
            totalPayments: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
            statusBreakdown: {},
            methodBreakdown: {}
        };

        payments.forEach(payment => {
            stats.statusBreakdown[payment.status] = (stats.statusBreakdown[payment.status] || 0) + 1;
            stats.methodBreakdown[payment.method] = (stats.methodBreakdown[payment.method] || 0) + 1;
        });

        return stats;
    }
}

module.exports = new PaymentService();
