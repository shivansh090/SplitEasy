const { Router } = require('express');
const { z } = require('zod');
const { sendPersonalMessage, getPersonalMessages, getPersonalExpenses } = require('../controllers/personal.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = Router();

const chatSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
});

router.use(auth);

router.post('/chat', validate(chatSchema), sendPersonalMessage);
router.get('/messages', getPersonalMessages);
router.get('/expenses', getPersonalExpenses);

module.exports = router;
