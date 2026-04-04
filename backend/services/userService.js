/**
 * User Service
 * Business logic for user operations
 */

const User = require('../models/user');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { ROLES } = require('../constants/roles');
const logger = require('../config/logger');

class UserService {
    /**
     * Get all users
     * @param {object} options - Query options (page, limit, role)
     * @returns {Promise<object>} Users list with pagination
     */
    async getAllUsers(options = {}) {
        const { page = 1, limit = 10, role } = options;
        const offset = (page - 1) * limit;

        const where = {};
        if (role) where.role = role;

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: ['id', 'username', 'email', 'role', 'name', 'login_count', 'last_login_at', 'created_at', 'updated_at'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['id', 'DESC']]
        });

        return {
            users: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        };
    }

    /**
     * Get user by ID
     * @param {number} userId - User ID
     * @returns {Promise<object>} User object
     */
    async getUserById(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'role', 'name', 'login_count', 'last_login_at', 'created_at', 'updated_at']
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<object>} User object
     */
    async getUserByEmail(email) {
        const user = await User.findOne({ where: { email } });
        return user;
    }

    /**
     * Get user by username
     * @param {string} username - Username
     * @returns {Promise<object>} User object
     */
    async getUserByUsername(username) {
        const user = await User.findOne({ where: { username } });
        return user;
    }

    /**
     * Create new user
     * @param {object} userData - User data
     * @returns {Promise<object>} Created user
     */
    async createUser(userData) {
        const { username, email, password, name, role = ROLES.CUSTOMER } = userData;

        // Check if email exists
        const existingEmail = await this.getUserByEmail(email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        // Check if username exists
        const existingUsername = await this.getUserByUsername(username);
        if (existingUsername) {
            throw new Error('Username already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            name,
            role
        });

        logger.info('User created', { userId: user.id, email: user.email });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    /**
     * Update user
     * @param {number} userId - User ID
     * @param {object} updateData - Data to update
     * @returns {Promise<object>} Updated user
     */
    async updateUser(userId, updateData) {
        const user = await this.getUserById(userId);

        const { username, email, role, name } = updateData;

        // Check email uniqueness if changing
        if (email && email !== user.email) {
            const existingEmail = await this.getUserByEmail(email);
            if (existingEmail) {
                throw new Error('Email already exists');
            }
        }

        // Check username uniqueness if changing
        if (username && username !== user.username) {
            const existingUsername = await this.getUserByUsername(username);
            if (existingUsername) {
                throw new Error('Username already exists');
            }
        }

        // Update user
        await user.update({
            username: username ?? user.username,
            email: email ?? user.email,
            role: role ?? user.role,
            name: name ?? user.name
        });

        logger.info('User updated', { userId: user.id });

        return user;
    }

    /**
     * Delete user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteUser(userId) {
        const user = await this.getUserById(userId);
        await user.destroy();

        logger.info('User deleted', { userId });

        return true;
    }

    /**
     * Verify user password
     * @param {number} userId - User ID
     * @param {string} password - Plain text password
     * @returns {Promise<boolean>} True if password matches
     */
    async verifyPassword(userId, password) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return await comparePassword(password, user.password);
    }

    /**
     * Change user password
     * @param {number} userId - User ID
     * @param {string} oldPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<boolean>} Success status
     */
    async changePassword(userId, oldPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        const isValid = await comparePassword(oldPassword, user.password);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await user.update({ password: hashedPassword });

        logger.info('Password changed', { userId });

        return true;
    }

    /**
     * Increment login count
     * @param {number} userId - User ID
     * @returns {Promise<void>}
     */
    async incrementLoginCount(userId) {
        const user = await User.findByPk(userId);
        if (user) {
            await user.update({
                login_count: (user.login_count || 0) + 1,
                last_login_at: new Date()
            });
        }
    }
}

module.exports = new UserService();
