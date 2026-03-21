const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null,
    index: { sparse: true },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: { sparse: true },
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  type: {
    type: String,
    enum: ['user_message', 'expense_created', 'system', 'ai_response'],
    default: 'user_message',
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
  },
  relatedExpense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
