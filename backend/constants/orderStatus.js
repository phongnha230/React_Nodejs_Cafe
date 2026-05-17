/**
 * Order Status Constants
 * MUST SYNC with frontend usage.
 */

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'preparing', 'ready', 'cancelled'],
  confirmed: ['preparing', 'ready', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering', 'delivered', 'cancelled'],
  delivering: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

module.exports = {
  ORDER_STATUS,
  VALID_TRANSITIONS,
};
