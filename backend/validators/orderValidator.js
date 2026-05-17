const { body } = require('express-validator');
const { handleValidationErrors } = require('./baseValidator');

/**
 * Order validation rules
 */
const validateOrderCreation = [
  body('table_id')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Table ID must be a positive integer'),
  body('table_number')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('Table number must be a positive integer'),
  body('note')
    .optional({ values: 'falsy' })
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
  body('voucher_code')
    .optional({ values: 'falsy' })
    .isLength({ min: 1, max: 50 })
    .withMessage('Voucher code cannot exceed 50 characters'),
  body('user_voucher_id')
    .optional({ values: 'falsy' })
    .isInt({ min: 1 })
    .withMessage('User voucher ID must be a positive integer'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.product_id')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid product_id'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item must have a quantity of at least 1'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('Each item must have a valid unit_price'),
  handleValidationErrors
];

module.exports = {
  validateOrderCreation
};
