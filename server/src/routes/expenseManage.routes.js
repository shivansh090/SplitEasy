const { Router } = require('express');
const { z } = require('zod');
const { updateExpense, deleteExpense } = require('../controllers/expense.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = Router();

const updateExpenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().min(1).max(200).optional(),
  category: z.enum(['food', 'transport', 'shopping', 'entertainment', 'bills', 'rent', 'groceries', 'medical', 'travel', 'general']).optional(),
});

router.use(auth);

router.put('/:expenseId', validate(updateExpenseSchema), updateExpense);
router.delete('/:expenseId', deleteExpense);

module.exports = router;
