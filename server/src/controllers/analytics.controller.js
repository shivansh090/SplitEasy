const analyticsService = require('../services/analytics.service');
const groupService = require('../services/group.service');
const ApiResponse = require('../utils/ApiResponse');

const getPersonalAnalytics = async (req, res, next) => {
  try {
    const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
    const data = await analyticsService.getPersonalAnalytics(req.user._id, { month, year });
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

const getGroupAnalytics = async (req, res, next) => {
  try {
    await groupService.getGroupById(req.params.id, req.user._id);
    const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
    const data = await analyticsService.getGroupAnalytics(req.params.id, { month, year });
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
    const data = await analyticsService.getDashboardAnalytics(req.user._id, { month, year });
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPersonalAnalytics, getGroupAnalytics, getDashboardAnalytics };
