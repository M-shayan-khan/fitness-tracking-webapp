const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  exportWorkoutsCSV,
  exportWorkoutsPDF // <--- Add this
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/export/workouts', protect, exportWorkoutsCSV);      // CSV Format
router.get('/export/workouts-pdf', protect, exportWorkoutsPDF);  // PDF Format

module.exports = router;