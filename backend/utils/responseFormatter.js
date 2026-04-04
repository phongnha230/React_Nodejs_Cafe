/**
 * Response Formatter Utilities
 * Standardize API responses
 */

/**
 * Success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {object} meta - Additional metadata
 * @returns {object} Formatted response
 */
exports.success = (data, message = 'Success', meta = {}) => {
    return {
        success: true,
        message,
        data,
        ...meta
    };
};

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} code - Error code
 * @param {*} errors - Validation errors or details
 * @returns {object} Formatted error response
 */
exports.error = (message, code = 500, errors = null) => {
    const response = {
        success: false,
        message,
        code
    };

    if (errors) {
        response.errors = errors;
    }

    return response;
};

/**
 * Paginated response
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {object} Formatted paginated response
 */
exports.paginated = (data, page, limit, total) => {
    return {
        success: true,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        }
    };
};

/**
 * Created response (201)
 * @param {*} data - Created resource
 * @param {string} message - Success message
 * @returns {object} Formatted response
 */
exports.created = (data, message = 'Resource created successfully') => {
    return {
        success: true,
        message,
        data
    };
};

/**
 * No content response (204)
 * @returns {object} Empty response
 */
exports.noContent = () => {
    return {
        success: true,
        message: 'No content'
    };
};
