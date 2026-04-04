const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  // Log error với Winston
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  // Chỉ hiển thị stack trace trong development
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
    payload.details = err;
  }

  // Nếu là Sequelize error, xử lý đặc biệt
  if (err.name === 'SequelizeValidationError') {
    payload.message = 'Validation Error';
    payload.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    payload.message = 'Duplicate Entry';
    payload.errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }

  if (!res.headersSent) {
    res.status(status).json(payload);
  } else {
    next(err);
  }
};

