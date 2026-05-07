const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logDir = path.join(__dirname, '../logs');
const transports = [];

try {
  fs.mkdirSync(logDir, { recursive: true });
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    })
  );
} catch (error) {
  console.warn(`Logger file transport disabled: ${error.message}`);
}

if (process.env.NODE_ENV !== 'production' || transports.length === 0) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cafe-backend' },
  transports,
});

module.exports = logger;
