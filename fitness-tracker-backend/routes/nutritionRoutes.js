const express = require('express');
const router = express.Router();
const {
  getNutritionRecords,
  addNutritionRecord,
  updateNutrition,
  deleteNutritionRecord,
  getNutritionSummary
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getNutritionSummary); // <--- Daily Summary API
router.route('/').get(protect, getNutritionRecords).post(protect, addNutritionRecord);
router.route('/:id').delete(protect, deleteNutritionRecord).put( protect, updateNutrition);

module.exports = router;