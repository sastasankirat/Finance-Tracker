const mongoose = require('mongoose');

// Transaction schema
const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  category: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// CRUD Operations

// Create transaction
const createTransaction = async (transactionData) => {
  const transaction = new Transaction(transactionData);
  const saved = await transaction.save();
  return saved.toObject();
};

// Get all transactions for a user
const getUserTransactions = async (userId, options = {}) => {
  const { 
    startDate, 
    endDate, 
    type, 
    category,
    limit = 100,
    skip = 0,
    sort = { date: -1 }
  } = options;

  const query = { userId };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (type) query.type = type;
  if (category) query.category = category;

  return Transaction.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .lean();
};

// Get transaction by ID
const getTransactionById = async (id, userId) => {
  return Transaction.findOne({ _id: id, userId }).lean();
};

// Update transaction
const updateTransaction = async (id, userId, updates) => {
  return Transaction.findOneAndUpdate(
    { _id: id, userId },
    { ...updates, updatedAt: Date.now() },
    { new: true }
  ).lean();
};

// Delete transaction
const deleteTransaction = async (id, userId) => {
  return Transaction.findOneAndDelete({ _id: id, userId }).lean();
};

// Get transaction summary
const getTransactionSummary = async (userId, startDate, endDate) => {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const summary = await Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    totalIncome: 0,
    totalExpense: 0,
    incomeCount: 0,
    expenseCount: 0,
    balance: 0
  };

  summary.forEach(item => {
    if (item._id === 'income') {
      result.totalIncome = item.total;
      result.incomeCount = item.count;
    } else if (item._id === 'expense') {
      result.totalExpense = item.total;
      result.expenseCount = item.count;
    }
  });

  result.balance = result.totalIncome - result.totalExpense;

  return result;
};

// Get category-wise summary
const getCategorySummary = async (userId, type, startDate, endDate) => {
  const matchStage = { 
    userId: new mongoose.Types.ObjectId(userId),
    type 
  };
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  return Transaction.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);
};

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getCategorySummary
};