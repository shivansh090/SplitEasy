const Expense = require('../models/Expense');
const Message = require('../models/Message');
const ApiError = require('../utils/ApiError');

const createExpense = async ({ group, paidBy, amount, description, category, splitType, splits, originalMessage, createdBy }) => {
  const expense = await Expense.create({
    group,
    paidBy,
    amount,
    description,
    category,
    splitType,
    splits,
    originalMessage,
    createdBy,
  });

  const populated = await expense.populate([
    { path: 'paidBy', select: 'name email' },
    { path: 'splits.user', select: 'name email' },
  ]);

  const splitDetails = populated.splits
    .map((s) => `${s.user.name}: ₹${s.amount.toFixed(2)}`)
    .join(', ');

  await Message.create({
    group,
    type: 'expense_created',
    content: JSON.stringify({
      description: populated.description,
      amount: populated.amount,
      paidBy: populated.paidBy.name,
      category: populated.category,
      splits: populated.splits.map((s) => ({
        name: s.user.name,
        amount: s.amount,
      })),
    }),
    relatedExpense: expense._id,
  });

  return populated;
};

const getGroupExpenses = async (groupId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    Expense.find({ group: groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments({ group: groupId }),
  ]);

  return {
    expenses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const createPersonalExpense = async ({ paidBy, amount, description, category, expenseDate, originalMessage, createdBy }) => {
  const expense = await Expense.create({
    group: null,
    isPersonal: true,
    paidBy,
    amount,
    description,
    category,
    expenseDate: expenseDate || new Date(),
    splitType: 'equal',
    splits: [],
    originalMessage,
    createdBy,
  });

  const populated = await expense.populate({ path: 'paidBy', select: 'name email' });

  await Message.create({
    group: null,
    user: createdBy,
    type: 'expense_created',
    content: JSON.stringify({
      description: populated.description,
      amount: populated.amount,
      paidBy: populated.paidBy.name,
      category: populated.category,
      splits: [],
    }),
    relatedExpense: expense._id,
  });

  return populated;
};

const getPersonalExpenses = async (userId, page = 1, limit = 50, month, year) => {
  const skip = (page - 1) * limit;
  const query = { createdBy: userId, isPersonal: true };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    query.createdAt = { $gte: start, $lt: end };
  } else if (year) {
    const start = new Date(year, 0, 1);
    const end = new Date(Number(year) + 1, 0, 1);
    query.createdAt = { $gte: start, $lt: end };
  }

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .populate('paidBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(query),
  ]);

  return {
    expenses,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

const updateExpense = async (expenseId, userId, updates) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new ApiError(404, 'Expense not found');
  if (expense.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only edit your own expenses');
  }

  const allowed = ['amount', 'description', 'category', 'expenseDate'];
  for (const key of allowed) {
    if (updates[key] !== undefined) expense[key] = updates[key];
  }
  await expense.save();

  return expense.populate([
    { path: 'paidBy', select: 'name email' },
    { path: 'splits.user', select: 'name email' },
  ]);
};

const deleteExpense = async (expenseId, userId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new ApiError(404, 'Expense not found');
  if (expense.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only delete your own expenses');
  }

  await Message.deleteMany({ relatedExpense: expenseId });
  await expense.deleteOne();

  return { deleted: true };
};

const getRecentExpensesSummary = async (userId, limit = 5) => {
  const expenses = await Expense.find({
    $or: [
      { createdBy: userId, isPersonal: true },
      { paidBy: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('description amount category expenseDate createdAt _id');
  return expenses;
};

module.exports = {
  createExpense, getGroupExpenses, createPersonalExpense, getPersonalExpenses,
  updateExpense, deleteExpense, getRecentExpensesSummary,
};
