const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getUserDashboard,
    getWorkoutAnalytics,
    getNutritionAnalytics
} = require('../controllers/dashboardController');

// Saare dashboard routes protected hain
router.use(auth);

router.get('/', getUserDashboard);
router.get('/workout-analytics', getWorkoutAnalytics);
router.get('/nutrition-analytics', getNutritionAnalytics);

module.exports = router;