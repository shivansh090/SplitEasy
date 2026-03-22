const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const User = require('../models/User');

const getDailyTrend = async (matchBase, month, year) => {
  if (!month || !year) return [];
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return Expense.aggregate([
    { $match: { ...matchBase, createdAt: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: { day: { $dayOfMonth: '$createdAt' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.day': 1 } },
  ]).then((res) => res.map((d) => ({ day: d._id.day, total: Math.round(d.total * 100) / 100, count: d.count })));
};

const buildDateFilter = (month, year, day) => {
  if (day && month && year) {
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + 1);
    return { createdAt: { $gte: start, $lt: end } };
  }
  if (month && year) {
    return { createdAt: { $gte: new Date(year, month - 1, 1), $lt: new Date(year, month, 1) } };
  }
  if (year) {
    return { createdAt: { $gte: new Date(year, 0, 1), $lt: new Date(Number(year) + 1, 0, 1) } };
  }
  return {};
};

const getPersonalAnalytics = async (userId, { month, year, day } = {}) => {
  const userObjId = new mongoose.Types.ObjectId(userId);
  const dateFilter = buildDateFilter(month, year, day);
  const match = { createdBy: userObjId, isPersonal: true, ...dateFilter };

  const personalBase = { createdBy: userObjId, isPersonal: true };
  const [categoryBreakdown, monthlyTrend, summary, dailyTrend] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: personalBase },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
          avgExpense: { $avg: '$amount' },
        },
      },
    ]),
    getDailyTrend(personalBase, month, year),
  ]);

  const grandTotal = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
  const categoryWithPercent = categoryBreakdown.map((c) => ({
    category: c._id,
    total: Math.round(c.total * 100) / 100,
    count: c.count,
    percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 1000) / 10 : 0,
  }));

  const trend = monthlyTrend.reverse().map((m) => ({
    year: m._id.year,
    month: m._id.month,
    total: Math.round(m.total * 100) / 100,
    count: m.count,
  }));

  const s = summary[0] || { totalSpent: 0, expenseCount: 0, avgExpense: 0 };

  return {
    categoryBreakdown: categoryWithPercent,
    monthlyTrend: trend,
    dailyTrend,
    totalSpent: Math.round(s.totalSpent * 100) / 100,
    expenseCount: s.expenseCount,
    avgExpense: Math.round((s.avgExpense || 0) * 100) / 100,
  };
};

const getGroupAnalytics = async (groupId, { month, year, day } = {}) => {
  const groupObjId = new mongoose.Types.ObjectId(groupId);
  const dateFilter = buildDateFilter(month, year, day);
  const match = { group: groupObjId, ...dateFilter };

  const [categoryBreakdown, monthlyTrend, memberBreakdown, summary] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: { group: groupObjId } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$paidBy', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
    ]),
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
          avgExpense: { $avg: '$amount' },
        },
      },
    ]),
  ]);

  const grandTotal = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
  const memberTotal = memberBreakdown.reduce((sum, m) => sum + m.total, 0);

  const s = summary[0] || { totalSpent: 0, expenseCount: 0, avgExpense: 0 };

  return {
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c._id,
      total: Math.round(c.total * 100) / 100,
      count: c.count,
      percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 1000) / 10 : 0,
    })),
    monthlyTrend: monthlyTrend.reverse().map((m) => ({
      year: m._id.year,
      month: m._id.month,
      total: Math.round(m.total * 100) / 100,
      count: m.count,
    })),
    memberBreakdown: memberBreakdown.map((m) => ({
      userId: m._id.toString(),
      name: m.userInfo.name,
      total: Math.round(m.total * 100) / 100,
      count: m.count,
      percentage: memberTotal > 0 ? Math.round((m.total / memberTotal) * 1000) / 10 : 0,
    })),
    totalSpent: Math.round(s.totalSpent * 100) / 100,
    expenseCount: s.expenseCount,
    avgExpense: Math.round((s.avgExpense || 0) * 100) / 100,
  };
};

const getDashboardAnalytics = async (userId, { month, year, day } = {}) => {
  const user = await User.findById(userId);
  const groupIds = (user.groups || []).map((g) => new mongoose.Types.ObjectId(g));
  const userObjId = new mongoose.Types.ObjectId(userId);
  const dateFilter = buildDateFilter(month, year, day);

  const match = {
    $or: [
      { createdBy: userObjId, isPersonal: true },
      ...(groupIds.length > 0 ? [{ group: { $in: groupIds } }] : []),
    ],
    ...dateFilter,
  };

  const dashBase = { $or: match.$or };
  const [categoryBreakdown, monthlyTrend, summary, dailyTrend] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: dashBase },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
          avgExpense: { $avg: '$amount' },
        },
      },
    ]),
    getDailyTrend(dashBase, month, year),
  ]);

  const recentExpenses = await Expense.find(match)
    .populate('paidBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  const grandTotal = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
  const s = summary[0] || { totalSpent: 0, expenseCount: 0, avgExpense: 0 };

  return {
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c._id,
      total: Math.round(c.total * 100) / 100,
      count: c.count,
      percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 1000) / 10 : 0,
    })),
    monthlyTrend: monthlyTrend.reverse().map((m) => ({
      year: m._id.year,
      month: m._id.month,
      total: Math.round(m.total * 100) / 100,
      count: m.count,
    })),
    dailyTrend,
    totalSpent: Math.round(s.totalSpent * 100) / 100,
    expenseCount: s.expenseCount,
    avgExpense: Math.round((s.avgExpense || 0) * 100) / 100,
    recentExpenses: recentExpenses.map((e) => ({
      _id: e._id,
      description: e.description,
      amount: e.amount,
      category: e.category,
      isPersonal: e.isPersonal,
      paidBy: e.paidBy,
      createdAt: e.createdAt,
    })),
  };
};

module.exports = { getPersonalAnalytics, getGroupAnalytics, getDashboardAnalytics };
