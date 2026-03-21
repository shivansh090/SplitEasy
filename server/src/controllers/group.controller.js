const groupService = require('../services/group.service');
const ApiResponse = require('../utils/ApiResponse');

const createGroup = async (req, res, next) => {
  try {
    const group = await groupService.createGroup(req.validatedBody, req.user._id);
    ApiResponse.success(res, { group }, 201);
  } catch (error) {
    next(error);
  }
};

const getUserGroups = async (req, res, next) => {
  try {
    const groups = await groupService.getUserGroups(req.user._id);
    ApiResponse.success(res, { groups });
  } catch (error) {
    next(error);
  }
};

const getGroupById = async (req, res, next) => {
  try {
    const group = await groupService.getGroupById(req.params.id, req.user._id);
    ApiResponse.success(res, { group });
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const group = await groupService.joinGroup(req.validatedBody.inviteCode, req.user._id);
    ApiResponse.success(res, { group });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, getUserGroups, getGroupById, joinGroup };
