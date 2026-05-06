/**
 * Order Status Constants
 * ⚠️ MUST SYNC with Frontend constants
 */

module.exports = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    DELIVERING: 'delivering',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Valid status transitions
module.exports.VALID_TRANSITIONS = {
    pending: ['confirmed', 'ready', 'cancelled'],
    confirmed: ['preparing', 'ready', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['delivering', 'delivered', 'cancelled'],
    delivering: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: []
};
