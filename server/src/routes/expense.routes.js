const { Router } = require('express');
const { getGroupExpenses, getGroupBalances } = require('../controllers/expense.controller');
const auth = require('../middleware/auth.middleware');

const router = Router();

router.use(auth);

router.get('/:id/expenses', getGroupExpenses);
router.get('/:id/balances', getGroupBalances);

module.exports = router;
