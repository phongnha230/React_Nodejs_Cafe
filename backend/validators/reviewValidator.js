const { body } = require('express-validator');
const { handleValidationErrors } = require('./baseValidator');

/**
 * Review validation rules
 */
const validateReviewCreation = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  body('media_url')
    .optional()
    .custom((value) => {
      if (!value) return true;
      if (
        typeof value === 'string' &&
        (value.startsWith('http') || value.startsWith('data:image') || value.startsWith('data:video'))
      ) return true;
      throw new Error('Review media must be a valid URL or image/video base64 data');
    }),
  handleValidationErrors
];

const validateReviewUpdate = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  body('media_url')
    .optional()
    .custom((value) => {
      if (!value) return true;
      if (
        typeof value === 'string' &&
        (value.startsWith('http') || value.startsWith('data:image') || value.startsWith('data:video'))
      ) return true;
      throw new Error('Review media must be a valid URL or image/video base64 data');
    }),
  handleValidationErrors
];

module.exports = {
  validateReviewCreation,
  validateReviewUpdate
};
