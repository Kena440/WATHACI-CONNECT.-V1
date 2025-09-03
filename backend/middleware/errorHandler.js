const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Request error', err.stack || err, 'ErrorHandler');
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
