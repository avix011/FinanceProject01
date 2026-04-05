const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authorizationMiddleware');

const router = express.Router();

// All dashboard routes require authentication and read:dashboard permission
router.use(authMiddleware);
router.use(authorize('read:dashboard'));

// Get summary (total income, expense, balance)
router.get('/summary', dashboardController.getSummary);

// Get category breakdown
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);

// Get recent activity
router.get('/recent-activity', dashboardController.getRecentActivity);

// Get monthly trends
router.get('/monthly-trends', dashboardController.getMonthlyTrends);

// Combined insights endpoint: total balance + category breakdown + monthly trends
router.get('/insights', dashboardController.getInsights);

module.exports = router;
