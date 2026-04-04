/**
 * Auth Service
 * Business logic for authentication operations
 */

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { ROLES } = require('../constants/roles');
const { JWT_EXPIRATION } = require('../constants/config');
const logger = require('../config/logger');

class AuthService {
    /**
     * Register new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Created user (without password)
     */
    async register(userData) {
        const { username, email, password, role = ROLES.CUSTOMER } = userData;

        // Validation
        if (!username || !email || !password) {
            throw new Error('Username, email, and password are required');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        // Validate password length
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            throw new Error('Email already in use');
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            throw new Error('Username already in use');
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        });

        logger.info('User registered', {
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} Token and user data
     */
    async login(email, password) {
        // Validation
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Update login tracking
        await user.update({
            login_count: (user.login_count || 0) + 1,
            last_login_at: new Date()
        });

        // Generate JWT token
        const token = this.generateToken(user);

        logger.info('User logged in', {
            userId: user.id,
            email: user.email
        });

        // Return token and user data (without password)
        const { password: _, ...userWithoutPassword } = user.toJSON();

        return {
            token,
            user: userWithoutPassword
        };
    }

    /**
     * Generate JWT token
     * @param {object} user - User object
     * @returns {string} JWT token
     */
    generateToken(user) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: JWT_EXPIRATION
        });
    }

    /**
     * Verify JWT token
     * @param {string} token - JWT token
     * @returns {Promise<object>} Decoded token payload
     */
    async verifyToken(token) {
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not configured');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Get current user profile
     * @param {number} userId - User ID from token
     * @returns {Promise<object>} User profile
     */
    async getCurrentUser(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'role', 'name', 'login_count', 'last_login_at', 'created_at', 'updated_at']
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    /**
     * Change password
     * @param {number} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<boolean>} Success status
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await user.update({ password: hashedPassword });

        logger.info('Password changed', { userId });

        return true;
    }

    /**
     * Logout user (invalidate token - client-side)
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async logout(userId) {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token. This method is for logging purposes.

        logger.info('User logged out', { userId });

        return true;
    }

    /**
     * Refresh token
     * @param {string} oldToken - Old JWT token
     * @returns {Promise<object>} New token and user data
     */
    async refreshToken(oldToken) {
        // Verify old token
        const decoded = await this.verifyToken(oldToken);

        // Get user
        const user = await User.findByPk(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }

        // Generate new token
        const newToken = this.generateToken(user);

        logger.info('Token refreshed', { userId: user.id });

        const { password: _, ...userWithoutPassword } = user.toJSON();

        return {
            token: newToken,
            user: userWithoutPassword
        };
    }
}

module.exports = new AuthService();
