const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getCategorySummary
} = require('../models/transactionModel');

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
};

// Get all transactions for logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate, type, category, limit, skip } = req.query;
    
    const options = {};
    if (startDate) options.startDate = startDate;
    if (endDate) options.endDate = endDate;
    if (type) options.type = type;
    if (category) options.category = category;
    if (limit) options.limit = parseInt(limit);
    if (skip) options.skip = parseInt(skip);

    const transactions = await getUserTransactions(req.user._id, options);
    
    res.json({ 
      success: true, 
      transactions 
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transactions' 
    });
  }
});

// Get single transaction
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const transaction = await getTransactionById(req.params.id, req.user._id);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    res.json({ 
      success: true, 
      transaction 
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transaction' 
    });
  }
});

// Create transaction
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    // Validation
    if (!type || !amount || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type, amount, and category are required' 
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either income or expense' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    const transaction = await createTransaction({
      userId: req.user._id,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: date ? new Date(date) : new Date()
    });

    res.status(201).json({ 
      success: true, 
      message: 'Transaction created successfully',
      transaction 
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating transaction' 
    });
  }
});

// Update transaction
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    
    const updates = {};
    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Type must be either income or expense' 
        });
      }
      updates.type = type;
    }
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Amount must be greater than 0' 
        });
      }
      updates.amount = parseFloat(amount);
    }
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date) updates.date = new Date(date);

    const transaction = await updateTransaction(req.params.id, req.user._id, updates);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Transaction updated successfully',
      transaction 
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating transaction' 
    });
  }
});

// Delete transaction
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const transaction = await deleteTransaction(req.params.id, req.user._id);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Transaction deleted successfully' 
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting transaction' 
    });
  }
});

// Get transaction summary
router.get('/summary/overview', isAuthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const summary = await getTransactionSummary(
      req.user._id,
      startDate,
      endDate
    );
    
    res.json({ 
      success: true, 
      summary 
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching summary' 
    });
  }
});

// Get category-wise summary
router.get('/summary/categories', isAuthenticated, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid type (income or expense) is required' 
      });
    }
    
    const categories = await getCategorySummary(
      req.user._id,
      type,
      startDate,
      endDate
    );
    
    res.json({ 
      success: true, 
      categories 
    });
  } catch (error) {
    console.error('Get category summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching category summary' 
    });
  }
});

module.exports = router;