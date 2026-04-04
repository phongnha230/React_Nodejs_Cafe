/**
 * Encryption Utilities
 * Password hashing, token generation, etc.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { BCRYPT_ROUNDS } = require('../constants/config');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if match
 */
exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Random hex token
 */
exports.generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate random numeric code
 * @param {number} digits - Number of digits (default: 6)
 * @returns {string} Random numeric code
 */
exports.generateNumericCode = (digits = 6) => {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Hash data using SHA256
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
exports.sha256 = (data) => {
    return crypto.createHash('sha256').update(data).digest('hex');
};
