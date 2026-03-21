const mongoose = require('mongoose');
const crypto = require('crypto');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nickname: {
    type: String,
    default: '',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    default: '',
    maxlength: 500,
  },
  members: [memberSchema],
  inviteCode: {
    type: String,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

groupSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);
