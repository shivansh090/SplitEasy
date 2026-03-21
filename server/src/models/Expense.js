const mongoose = require('mongoose');

const splitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  category: {
    type: String,
    default: 'general',
    enum: ['food', 'transport', 'shopping', 'entertainment', 'bills', 'rent', 'groceries', 'medical', 'travel', 'general'],
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage', 'shares'],
    default: 'equal',
  },
  splits: [splitSchema],
  originalMessage: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);
