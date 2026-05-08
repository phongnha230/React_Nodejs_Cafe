const { body } = require('express-validator');
const { handleValidationErrors } = require('./baseValidator');

/**
 * Product validation rules
 */
const validateProductCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('image_url')
    .optional()
    .custom((value) => {
      if (!value) return true;
      // Allow valid URL or data:image base64
      if (value.startsWith('http') || value.startsWith('data:image')) return true;
      throw new Error('Image must be a valid URL or base64 data');
    }),
  handleValidationErrors
];

const validateProductUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name must be between 1 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('image') // Frontend sends 'image'
    .optional(),
  body('image_url')
    .optional(),
  handleValidationErrors
];

module.exports = {
  validateProductCreation,
  validateProductUpdate
};
