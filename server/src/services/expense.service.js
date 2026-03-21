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

module.exports = { createExpense, getGroupExpenses };
