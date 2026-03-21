const { Router } = require('express');
const { z } = require('zod');
const { sendMessage, getMessages } = require('../controllers/chat.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = Router();

const chatSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000),
});

router.use(auth);

router.post('/:id/chat', validate(chatSchema), sendMessage);
router.get('/:id/messages', getMessages);

module.exports = router;
