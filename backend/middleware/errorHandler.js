const logger = require('../config/logger');
const { error } = require('../utils/responseFormatter');

/**
 * Global Error Handler Middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack,
    details: err.errors || null
  });

  // Handle specific Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    err.statusCode = 400;
    err.message = 'Validation Error';
    err.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    err.statusCode = 400;
    err.message = 'Duplicate Entry';
    err.errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }

  // Development vs Production response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      errors: err.errors,
      error: err
    });
  } else {
    // Production response
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json(error(err.message, err.statusCode, err.errors));
    } else {
      // Programming or other unknown error: don't leak error details
      res.status(500).json(error('Something went wrong!', 500));
    }
  }
};
