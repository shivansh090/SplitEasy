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
    default: null,
    index: { sparse: true },
  },
  isPersonal: {
    type: Boolean,
    default: false,
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
  expenseDate: {
    type: Date,
    default: Date.now,
  },
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

expenseSchema.index({ createdBy: 1, isPersonal: 1, createdAt: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
