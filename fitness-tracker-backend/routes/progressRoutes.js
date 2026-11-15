const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    addProgress,
    getProgressHistory,
    getProgressChartData,
    updateProgress,
    deleteProgress
} = require('../controllers/progressController');

// Saare progress routes protected hain
router.use(auth);

router.post('/', addProgress);
router.get('/', getProgressHistory);
router.get('/chart-data', getProgressChartData); // Graphs ke liye formatted data
router.put('/:id', updateProgress);
router.delete('/:id', deleteProgress);

module.exports = router;