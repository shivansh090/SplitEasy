const ApiError = require('../utils/ApiError');
const { nodeEnv } = require('../config/env');

const errorHandler = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: `Duplicate value for ${field}`,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    error: nodeEnv === 'development' ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
