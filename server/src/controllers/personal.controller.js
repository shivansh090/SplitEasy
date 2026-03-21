const Message = require('../models/Message');
const expenseService = require('../services/expense.service');
const { validatePersonalAction } = require('../services/llm/parser');
const OpenRouterProvider = require('../services/llm/openrouter.provider');
const { openrouterApiKey } = require('../config/env');
const ApiResponse = require('../utils/ApiResponse');

const llmProvider = new OpenRouterProvider(openrouterApiKey);

const sendPersonalMessage = async (req, res, next) => {
  try {
    const { content } = req.validatedBody;
    const userId = req.user._id;
    const senderName = req.user.name;

    await Message.create({
      group: null,
      user: userId,
      sender: userId,
      type: 'user_message',
      content,
    });

    // Fetch recent expenses so LLM can match edit/delete targets
    const recentExpenses = await expenseService.getRecentExpensesSummary(userId, 10);

    let llmResult;
    try {
      llmResult = await llmProvider.parsePersonalExpense(content, senderName, recentExpenses);
    } catch (llmError) {
      console.error('LLM error (personal):', llmError.message);
      const fallbackMsg = "I'm having trouble right now. Could you try again?";
      await Message.create({ group: null, user: userId, type: 'ai_response', content: fallbackMsg });
      return ApiResponse.success(res, { aiMessage: fallbackMsg, expense: null });
    }

    // Handle multi-action (array) or single action
    const actions = Array.isArray(llmResult)
      ? llmResult.map((r) => validatePersonalAction(r, userId.toString()))
      : [validatePersonalAction(llmResult, userId.toString())];

    const confirmations = [];
    let lastExpense = null;

    for (const parsed of actions) {
      try {
        if (parsed.action === 'chat') {
          confirmations.push(parsed.reply);
          continue;
        }

        if (parsed.action === 'create') {
          lastExpense = await expenseService.createPersonalExpense({
            paidBy: userId,
            amount: parsed.expense.amount,
            description: parsed.expense.description,
            category: parsed.expense.category,
            expenseDate: parsed.expense.expenseDate,
            originalMessage: content,
            createdBy: userId,
          });
          confirmations.push(parsed.confirmation);
        }

        if (parsed.action === 'update') {
          lastExpense = await expenseService.updateExpense(parsed.targetExpenseId, userId, parsed.updates);
          confirmations.push(parsed.confirmation);
        }

        if (parsed.action === 'delete') {
          await expenseService.deleteExpense(parsed.targetExpenseId, userId);
          confirmations.push(parsed.confirmation);
        }
      } catch (err) {
        confirmations.push(`Failed: ${err.message}`);
      }
    }

    const aiMessage = confirmations.join('\n');
    await Message.create({ group: null, user: userId, type: 'ai_response', content: aiMessage });
    ApiResponse.success(res, { aiMessage, expense: lastExpense, actions: actions.map((a) => a.action) });
  } catch (error) {
    next(error);
  }
};

const getPersonalMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ user: userId, group: null })
        .populate('sender', 'name email avatar')
        .populate('relatedExpense')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ user: userId, group: null }),
    ]);

    ApiResponse.success(res, {
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const getPersonalExpenses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const month = req.query.month ? parseInt(req.query.month, 10) : undefined;
    const year = req.query.year ? parseInt(req.query.year, 10) : undefined;

    const data = await expenseService.getPersonalExpenses(userId, page, limit, month, year);
    ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

module.exports = { sendPersonalMessage, getPersonalMessages, getPersonalExpenses };
