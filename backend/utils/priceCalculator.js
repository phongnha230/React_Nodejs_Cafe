/**
 * Price Calculator Utilities
 * Price calculations, discounts, taxes
 */

/**
 * Calculate discount amount
 * @param {number} price - Original price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {number} Discounted price
 */
exports.calculateDiscount = (price, discountPercent) => {
    if (discountPercent < 0 || discountPercent > 100) {
        throw new Error('Discount percent must be between 0 and 100');
    }
    return price * (1 - discountPercent / 100);
};

/**
 * Calculate tax amount
 * @param {number} price - Price before tax
 * @param {number} taxRate - Tax rate (default: 0.1 = 10%)
 * @returns {number} Tax amount
 */
exports.calculateTax = (price, taxRate = 0.1) => {
    return price * taxRate;
};

/**
 * Calculate price with tax
 * @param {number} price - Price before tax
 * @param {number} taxRate - Tax rate (default: 0.1 = 10%)
 * @returns {number} Price including tax
 */
exports.calculatePriceWithTax = (price, taxRate = 0.1) => {
    return price * (1 + taxRate);
};

/**
 * Calculate subtotal from items
 * @param {Array} items - Array of items with quantity and unit_price
 * @returns {number} Subtotal
 */
exports.calculateSubtotal = (items) => {
    return items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
    }, 0);
};

/**
 * Round to 2 decimal places
 * @param {number} value - Value to round
 * @returns {number} Rounded value
 */
exports.roundPrice = (value) => {
    return Math.round(value * 100) / 100;
};

/**
 * Format price to VND currency
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
exports.formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

/**
 * Calculate loyalty points from order total
 * @param {number} orderTotal - Order total amount
 * @param {number} pointsPerVND - Points earned per VND (default: 0.01 = 1 point per 100 VND)
 * @returns {number} Loyalty points earned
 */
exports.calculateLoyaltyPoints = (orderTotal, pointsPerVND = 0.01) => {
    return Math.floor(orderTotal * pointsPerVND);
};
