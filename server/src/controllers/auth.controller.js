const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.validatedBody);
    ApiResponse.success(res, data, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.validatedBody);
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
