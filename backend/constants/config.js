/**
 * Application Configuration Constants
 * Backend-only configurations
 */

module.exports = {
    // JWT Configuration
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
    JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '30d',

    // Password Hashing
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,

    // Rate Limiting
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    LOGIN_ATTEMPT_WINDOW: parseInt(process.env.LOGIN_ATTEMPT_WINDOW) || 15 * 60 * 1000, // 15 minutes

    // Session
    SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT) || 3600, // 1 hour

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // File Upload
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],

    // Order
    ORDER_CANCELLATION_WINDOW: 30 * 60 * 1000, // 30 minutes

    // Email
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@cafeapp.com',
    EMAIL_SUPPORT: process.env.EMAIL_SUPPORT || 'support@cafeapp.com'
};
