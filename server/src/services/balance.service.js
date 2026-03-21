const Expense = require('../models/Expense');

const getGroupBalances = async (groupId) => {
  const expenses = await Expense.find({ group: groupId });

  const balances = {};

  for (const expense of expenses) {
    const payerId = expense.paidBy.toString();

    if (!balances[payerId]) balances[payerId] = 0;
    balances[payerId] += expense.amount;

    for (const split of expense.splits) {
      const owerId = split.user.toString();
      if (!balances[owerId]) balances[owerId] = 0;
      balances[owerId] -= split.amount;
    }
  }

  return balances;
};

const getDetailedBalances = async (groupId, members) => {
  const balances = await getGroupBalances(groupId);

  const detailed = members.map((member) => {
    const userId = member.user._id ? member.user._id.toString() : member.user.toString();
    const name = member.user.name || 'Unknown';
    const net = balances[userId] || 0;

    return {
      userId,
      name,
      balance: Math.round(net * 100) / 100,
    };
  });

  return detailed;
};

module.exports = { getGroupBalances, getDetailedBalances };
