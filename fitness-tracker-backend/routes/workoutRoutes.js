const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

// Yeh saare routes protected hain, matlab sirf logged-in user hi access kar sakta hai
router.route('/').get(protect, getWorkouts).post(protect, createWorkout);
router.route('/:id').delete(protect, deleteWorkout).put(protect, updateWorkout);

module.exports = router;