const Message = require('../models/Message');
const groupService = require('../services/group.service');
const expenseService = require('../services/expense.service');
const balanceService = require('../services/balance.service');
const { validateAndCleanExpense } = require('../services/llm/parser');
const OpenRouterProvider = require('../services/llm/openrouter.provider');
const { openrouterApiKey } = require('../config/env');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const llmProvider = new OpenRouterProvider(openrouterApiKey);

const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.validatedBody;
    const groupId = req.params.id;
    const userId = req.user._id;

    const group = await groupService.getGroupById(groupId, userId);

    await Message.create({
      group: groupId,
      sender: userId,
      type: 'user_message',
      content,
    });

    const memberNames = group.members.map((m) => m.user.name);
    const senderName = req.user.name;

    let llmResult;
    try {
      llmResult = await llmProvider.parseExpense(content, memberNames, senderName);
    } catch (llmError) {
      console.error('LLM error:', llmError.message, llmError.cause || '');
      const isRateLimit = llmError.status === 429 ||
        llmError.message?.includes('429') ||
        llmError.message?.includes('quota') ||
        llmError.message?.includes('rate');
      const isNetwork = llmError.message?.includes('Cannot reach') ||
        llmError.message?.includes('fetch failed') ||
        llmError.message?.includes('timed out');
      const fallbackMsg = isRateLimit
        ? "I'm being rate-limited by the AI service. Please wait a minute and try again."
        : isNetwork
        ? "Can't reach the AI service right now. Check your internet connection or try again shortly."
        : "I'm having trouble understanding that right now. Could you try rephrasing?";
      await Message.create({
        group: groupId,
        type: 'ai_response',
        content: fallbackMsg,
      });
      return ApiResponse.success(res, {
        aiMessage: fallbackMsg,
        expense: null,
        balances: null,
      });
    }

    const parsed = validateAndCleanExpense(llmResult, group.members, userId.toString(), senderName);

    if (!parsed.isExpense) {
      await Message.create({
        group: groupId,
        type: 'ai_response',
        content: parsed.reply,
      });
      return ApiResponse.success(res, {
        aiMessage: parsed.reply,
        expense: null,
        balances: null,
      });
    }

    const expense = await expenseService.createExpense({
      group: groupId,
      paidBy: parsed.expense.paidBy,
      amount: parsed.expense.amount,
      description: parsed.expense.description,
      category: parsed.expense.category,
      splitType: parsed.expense.splitType,
      splits: parsed.expense.splits,
      originalMessage: content,
      createdBy: userId,
    });

    await Message.create({
      group: groupId,
      type: 'ai_response',
      content: parsed.confirmation,
    });

    const balances = await balanceService.getDetailedBalances(groupId, group.members);

    ApiResponse.success(res, {
      aiMessage: parsed.confirmation,
      expense,
      balances,
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    await groupService.getGroupById(groupId, req.user._id);

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ group: groupId })
        .populate('sender', 'name email avatar')
        .populate('relatedExpense')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ group: groupId }),
    ]);

    ApiResponse.success(res, {
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages };
