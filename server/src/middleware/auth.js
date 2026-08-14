const { verifyAccessToken } = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return next(new ApiError(401, 'Not authorized, token failed'));
    }
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token'));
  }
});

module.exports = { protect };
