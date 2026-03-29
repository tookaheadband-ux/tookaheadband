const Expense = require('../models/Expense');

// Admin: get expenses
const getExpenses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) filter.date.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const end = new Date(req.query.dateTo);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    if (req.query.category) filter.category = req.query.category;

    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Expense.countDocuments(filter),
    ]);

    res.json({ expenses, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// Admin: create expense
const createExpense = async (req, res, next) => {
  try {
    const { description, amount, category, date } = req.body;
    if (!description || !amount) {
      return res.status(400).json({ message: 'Description and amount are required' });
    }

    const expense = await Expense.create({
      description,
      amount,
      category: category || 'general',
      date: date || new Date(),
    });

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

// Admin: delete expense
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExpenses, createExpense, deleteExpense };
