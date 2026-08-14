const ApiError = require('../utils/ApiError');
const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new ApiError(404, message);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ApiError(400, message);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message);
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'JSON Web Token is invalid. Try Again!!!';
    error = new ApiError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'JSON Web Token is expired. Try Again!!!';
    error = new ApiError(401, message);
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Server Error',
    stack: NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = errorHandler;
