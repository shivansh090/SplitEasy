const { Router } = require('express');
const { z } = require('zod');
const { createGroup, getUserGroups, getGroupById, joinGroup } = require('../controllers/group.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = Router();

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  description: z.string().max(500).optional().default(''),
});

const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
});

router.use(auth);

router.post('/', validate(createGroupSchema), createGroup);
router.get('/', getUserGroups);
router.get('/:id', getGroupById);
router.post('/:id/join', validate(joinGroupSchema), joinGroup);

module.exports = router;
