/**
 * Notification Service
 * Business logic for notification operations
 */

const Notification = require('../models/notification');
const User = require('../models/user');
const logger = require('../config/logger');

class NotificationService {
    /**
     * Create new notification
     * @param {object} notificationData - Notification data
     * @returns {Promise<object>} Created notification
     */
    async createNotification(notificationData) {
        const { title, message, type, user_id, read = false } = notificationData;

        // Validation
        if (!title || !message) {
            throw new Error('Title and message are required');
        }

        // Verify user exists if user_id provided
        if (user_id) {
            const user = await User.findByPk(user_id);
            if (!user) {
                throw new Error('User not found');
            }
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || null,
            user_id: user_id || null,
            read
        });

        logger.info('Notification created', {
            notificationId: notification.id,
            userId: user_id,
            type
        });

        return notification;
    }

    /**
     * Get all notifications
     * @param {object} options - Query options (userId, read, type, page, limit)
     * @returns {Promise<object>} Notifications list with pagination
     */
    async getAllNotifications(options = {}) {
        const { userId, read, type, page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const where = {};
        if (userId) where.user_id = userId;
        if (typeof read === 'boolean') where.read = read;
        if (type) where.type = type;

        const { count, rows } = await Notification.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']],
            include: [{
                model: User,
                attributes: ['id', 'username', 'email'],
                required: false
            }]
        });

        return {
            notifications: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get notification by ID
     * @param {number} notificationId - Notification ID
     * @returns {Promise<object>} Notification object
     */
    async getNotificationById(notificationId) {
        const notification = await Notification.findByPk(notificationId, {
            include: [{
                model: User,
                attributes: ['id', 'username', 'email']
            }]
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        return notification;
    }

    /**
     * Update notification
     * @param {number} notificationId - Notification ID
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated notification
     */
    async updateNotification(notificationId, updateData) {
        const notification = await Notification.findByPk(notificationId);

        if (!notification) {
            throw new Error('Notification not found');
        }

        const { title, message, type, read } = updateData;

        await notification.update({
            title: title || notification.title,
            message: message || notification.message,
            type: type !== undefined ? type : notification.type,
            read: typeof read === 'boolean' ? read : notification.read
        });

        logger.info('Notification updated', { notificationId });

        return notification;
    }

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @returns {Promise<object>} Updated notification
     */
    async markAsRead(notificationId) {
        const notification = await Notification.findByPk(notificationId);

        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.update({ read: true });

        logger.info('Notification marked as read', { notificationId });

        return notification;
    }

    /**
     * Mark all user notifications as read
     * @param {number} userId - User ID
     * @returns {Promise<number>} Number of notifications updated
     */
    async markAllAsRead(userId) {
        const [updatedCount] = await Notification.update(
            { read: true },
            {
                where: {
                    user_id: userId,
                    read: false
                }
            }
        );

        logger.info('All notifications marked as read', { userId, count: updatedCount });

        return updatedCount;
    }

    /**
     * Delete notification
     * @param {number} notificationId - Notification ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteNotification(notificationId) {
        const notification = await Notification.findByPk(notificationId);

        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.destroy();

        logger.info('Notification deleted', { notificationId });

        return true;
    }

    /**
     * Delete all user notifications
     * @param {number} userId - User ID
     * @returns {Promise<number>} Number of notifications deleted
     */
    async deleteAllUserNotifications(userId) {
        const deletedCount = await Notification.destroy({
            where: { user_id: userId }
        });

        logger.info('All user notifications deleted', { userId, count: deletedCount });

        return deletedCount;
    }

    /**
     * Get unread notification count for user
     * @param {number} userId - User ID
     * @returns {Promise<number>} Unread count
     */
    async getUnreadCount(userId) {
        const count = await Notification.count({
            where: {
                user_id: userId,
                read: false
            }
        });

        return count;
    }

    /**
     * Create bulk notifications for multiple users
     * @param {Array} userIds - Array of user IDs
     * @param {object} notificationData - Notification data
     * @returns {Promise<Array>} Created notifications
     */
    async createBulkNotifications(userIds, notificationData) {
        const { title, message, type } = notificationData;

        if (!title || !message) {
            throw new Error('Title and message are required');
        }

        const notifications = userIds.map(userId => ({
            title,
            message,
            type: type || null,
            user_id: userId,
            read: false
        }));

        const created = await Notification.bulkCreate(notifications);

        logger.info('Bulk notifications created', {
            count: created.length,
            type
        });

        return created;
    }
}

module.exports = new NotificationService();
