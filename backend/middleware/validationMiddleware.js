/**
 * Validation Middleware
 * Consolidates all validators for easy import
 */

const { handleValidationErrors } = require('../validators/baseValidator');
const { validateUserRegistration, validateUserLogin } = require('../validators/userValidator');
const { validateOrderCreation } = require('../validators/orderValidator');
const { validateProductCreation, validateProductUpdate } = require('../validators/productValidator');
const { validateReviewCreation } = require('../validators/reviewValidator');
const { validateId, validatePagination } = require('../validators/commonValidator');

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateOrderCreation,
  validateProductCreation,
  validateProductUpdate,
  validateReviewCreation,
  validateId,
  validatePagination
};
