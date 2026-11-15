const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    addNutritionLog,
    getNutritionLogs,
    updateNutritionLog,
    deleteNutritionLog
} = require('../controllers/nutritionController');

// Saare nutrition routes protected hain
router.use(auth);

router.post('/', addNutritionLog);
router.get('/', getNutritionLogs);
router.put('/:id', updateNutritionLog);
router.delete('/:id', deleteNutritionLog);

module.exports = router;