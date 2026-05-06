const { body } = require('express-validator');
const { handleValidationErrors } = require('./baseValidator');

/**
 * Order validation rules
 */
const validateOrderCreation = [
  body('table_number')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Table number must be a positive integer'),
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
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
