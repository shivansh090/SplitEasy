const expenseService = require('../services/expense.service');
const balanceService = require('../services/balance.service');
const groupService = require('../services/group.service');
const ApiResponse = require('../utils/ApiResponse');

const getGroupExpenses = async (req, res, next) => {
  try {
    await groupService.getGroupById(req.params.id, req.user._id);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const data = await expenseService.getGroupExpenses(req.params.id, page, limit);
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

const getGroupBalances = async (req, res, next) => {
  try {
    const group = await groupService.getGroupById(req.params.id, req.user._id);
    const balances = await balanceService.getDetailedBalances(req.params.id, group.members);
    ApiResponse.success(res, { balances });
  } catch (error) {
    next(error);
  }
};

const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(
      req.params.expenseId,
      req.user._id,
      req.validatedBody
    );
    ApiResponse.success(res, { expense });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.params.expenseId, req.user._id);
    ApiResponse.success(res, { message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGroupExpenses, getGroupBalances, updateExpense, deleteExpense };
