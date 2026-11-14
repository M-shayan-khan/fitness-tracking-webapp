const express = require('express');
const router = express.Router();
const {
  getProgressRecords,
  addProgressRecord,
  deleteProgressRecord,
  getProgressAnalytics
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getProgressAnalytics); // <--- Weight & Metrics Analytics API
router.route('/').get(protect, getProgressRecords).post(protect, addProgressRecord);
router.route('/:id').delete(protect, deleteProgressRecord);

module.exports = router;