const { Router } = require('express');
const { getPersonalAnalytics, getGroupAnalytics, getDashboardAnalytics } = require('../controllers/analytics.controller');
const auth = require('../middleware/auth.middleware');

const router = Router();

router.use(auth);

router.get('/dashboard', getDashboardAnalytics);
router.get('/personal', getPersonalAnalytics);
router.get('/groups/:id', getGroupAnalytics);

module.exports = router;
