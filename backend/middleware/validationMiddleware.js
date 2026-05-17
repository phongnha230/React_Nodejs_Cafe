/**
 * Validation Middleware
 * Consolidates all validators for easy import
 */

const { handleValidationErrors } = require('../validators/baseValidator');
const { validateUserRegistration, validateAdminUserCreation, validateUserLogin } = require('../validators/userValidator');
const { validateOrderCreation } = require('../validators/orderValidator');
const { validateProductCreation, validateProductUpdate } = require('../validators/productValidator');
const { validateReviewCreation, validateReviewUpdate } = require('../validators/reviewValidator');
const { validateId, validatePagination } = require('../validators/commonValidator');

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateAdminUserCreation,
  validateUserLogin,
  validateOrderCreation,
  validateProductCreation,
  validateProductUpdate,
  validateReviewCreation,
  validateReviewUpdate,
  validateId,
  validatePagination
};
