const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(error);
  }
};

module.exports = auth;
