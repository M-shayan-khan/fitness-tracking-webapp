const Workout = require('../models/Workout');

// @desc    Get all workouts for logged-in user (with optional category & tag filters)
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res) => {
  try {
    const { category, tag } = req.query;
    let query = { user: req.user._id };

    // Agar category query mein di gayi hai
    if (category) {
      query.category = category;
    }

    // Agar tag query mein diya gaya hai
    if (tag) {
      query.tags = tag; // MongoDB array matching
    }

    // req.user._id humein protect middleware se mil raha hai
    const workouts = await Workout.find(query).sort({ createdAt: -1 });
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const { exercise, category, tags, sets, reps, weight, duration, notes } = req.body;

    // Exercise aur category lazmi hain
    if (!exercise || !category) {
      return res.status(400).json({ message: 'Please fill in all required fields (exercise and category)' });
    }

    const workout = await Workout.create({
      user: req.user._id,
      exercise,
      category,
      tags: tags || [],            // Optional tags array
      sets: sets || 0,              // Default 0 (useful for cardio)
      reps: reps || 0,              // Default 0 (useful for cardio)
      weight: weight || 0,          // Default 0 kg
      duration: duration || 0,
      notes: notes || ''            // Ab yeh req.body se notes uthayega
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedWorkout = await Workout.findOneAndUpdate(
      { _id: id, user: req.user._id }, // Ensure user owns the workout
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedWorkout) {
      return res.status(404).json({ message: 'Workout not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: updatedWorkout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Check karo ke yeh workout usi user ka hai ya nahi jo delete karna chahta hai
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await workout.deleteOne();
    res.status(200).json({ message: 'Workout removed', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout
};