const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');

const generateToken = (userId) => {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  return {
    user: user.toJSON(),
    token,
  };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('groups', 'name');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

module.exports = { register, login, getProfile };
