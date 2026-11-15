const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    searchWorkouts,
    searchNutrition,
    searchUsers
} = require('../controllers/searchController');

// Saare search routes protected hain
router.use(auth);

router.get('/workouts', searchWorkouts);
router.get('/nutrition', searchNutrition);
router.get('/users', searchUsers);

module.exports = router;