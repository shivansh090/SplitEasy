const ApiError = require('../../utils/ApiError');

const resolveMemberName = (name, members, senderId, senderName) => {
  const lowerName = name.toLowerCase().trim();

  if (['me', 'i', 'myself'].includes(lowerName) || lowerName === senderName.toLowerCase()) {
    return senderId;
  }

  for (const member of members) {
    const memberName = member.user.name.toLowerCase();
    if (memberName === lowerName || memberName.includes(lowerName) || lowerName.includes(memberName)) {
      return member.user._id.toString();
    }
  }

  return null;
};

const validateAndCleanExpense = (llmOutput, members, senderId, senderName) => {
  if (!llmOutput.isExpense) {
    return {
      isExpense: false,
      reply: llmOutput.reply || "I didn't quite catch that. Could you rephrase?",
    };
  }

  const { expense, confirmation } = llmOutput;

  if (!expense || !expense.amount || !expense.description) {
    throw new ApiError(400, 'LLM output missing required expense fields');
  }

  if (typeof expense.amount !== 'number' || expense.amount <= 0) {
    throw new ApiError(400, 'Invalid expense amount');
  }

  const paidById = resolveMemberName(expense.paidBy, members, senderId, senderName);
  if (!paidById) {
    throw new ApiError(400, `Could not identify who paid: "${expense.paidBy}"`);
  }

  const splitAmong = expense.splitAmong || [];
  if (splitAmong.length === 0) {
    throw new ApiError(400, 'No one to split with');
  }

  const resolvedSplits = [];
  const seenIds = new Set();

  for (const name of splitAmong) {
    const userId = resolveMemberName(name, members, senderId, senderName);
    if (userId && !seenIds.has(userId)) {
      seenIds.add(userId);
      resolvedSplits.push(userId);
    }
  }

  if (resolvedSplits.length === 0) {
    throw new ApiError(400, 'Could not resolve any members for the split');
  }

  const splitAmount = Math.round((expense.amount / resolvedSplits.length) * 100) / 100;

  let remainder = Math.round((expense.amount - splitAmount * resolvedSplits.length) * 100) / 100;

  const splits = resolvedSplits.map((userId, index) => ({
    user: userId,
    amount: index === 0 ? splitAmount + remainder : splitAmount,
  }));

  const validCategories = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'rent', 'groceries', 'medical', 'travel', 'general'];
  const category = validCategories.includes(expense.category) ? expense.category : 'general';

  return {
    isExpense: true,
    expense: {
      paidBy: paidById,
      amount: expense.amount,
      description: expense.description,
      category,
      splitType: 'equal',
      splits,
    },
    confirmation: confirmation || `Expense of ₹${expense.amount} recorded.`,
  };
};

module.exports = { validateAndCleanExpense, resolveMemberName };
