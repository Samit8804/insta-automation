const { Router } = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const {
  getDashboardStats,
  getAnalytics,
  getAdminStats,
} = require('../controllers/analyticsController');

const router = Router();
router.use(auth);

router.get('/dashboard', getDashboardStats);
router.get('/details', getAnalytics);
router.get('/admin', adminOnly, getAdminStats);

module.exports = router;
