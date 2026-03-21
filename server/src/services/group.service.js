const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');

const createGroup = async ({ name, description }, userId) => {
  const group = await Group.create({
    name,
    description,
    members: [{ user: userId }],
    createdBy: userId,
  });

  await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });

  await Message.create({
    group: group._id,
    type: 'system',
    content: `Group "${name}" created. Share the invite code ${group.inviteCode} to add members.`,
  });

  return group.populate('members.user', 'name email avatar');
};

const getUserGroups = async (userId) => {
  const groups = await Group.find({ 'members.user': userId })
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });
  return groups;
};

const getGroupById = async (groupId, userId) => {
  const group = await Group.findById(groupId)
    .populate('members.user', 'name email avatar');

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const isMember = group.members.some(
    (m) => m.user._id.toString() === userId.toString()
  );
  if (!isMember) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  return group;
};

const joinGroup = async (inviteCode, userId) => {
  const group = await Group.findOne({ inviteCode });
  if (!group) {
    throw new ApiError(404, 'Invalid invite code');
  }

  const alreadyMember = group.members.some(
    (m) => m.user.toString() === userId.toString()
  );
  if (alreadyMember) {
    throw new ApiError(400, 'You are already a member of this group');
  }

  group.members.push({ user: userId });
  await group.save();

  await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id } });

  const user = await User.findById(userId);
  await Message.create({
    group: group._id,
    type: 'system',
    content: `${user.name} joined the group.`,
  });

  return group.populate('members.user', 'name email avatar');
};

module.exports = { createGroup, getUserGroups, getGroupById, joinGroup };
