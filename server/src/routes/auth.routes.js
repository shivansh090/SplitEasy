const { Router } = require('express');
const { z } = require('zod');
const { register, login, getMe } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, getMe);

module.exports = router;
