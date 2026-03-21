const analyticsService = require('../services/analytics.service');
const groupService = require('../services/group.service');
const ApiResponse = require('../utils/ApiResponse');

const parseFilters = (query) => ({
  month: query.month ? parseInt(query.month, 10) : undefined,
  year: query.year ? parseInt(query.year, 10) : undefined,
  day: query.day ? parseInt(query.day, 10) : undefined,
});

const getPersonalAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getPersonalAnalytics(req.user._id, parseFilters(req.query));
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

const getGroupAnalytics = async (req, res, next) => {
  try {
    await groupService.getGroupById(req.params.id, req.user._id);
    const data = await analyticsService.getGroupAnalytics(req.params.id, parseFilters(req.query));
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getDashboardAnalytics(req.user._id, parseFilters(req.query));
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPersonalAnalytics, getGroupAnalytics, getDashboardAnalytics };
