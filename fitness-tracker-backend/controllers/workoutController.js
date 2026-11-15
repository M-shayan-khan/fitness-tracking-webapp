const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const { createNotification } = require('./notificationController');

// ==========================================
// 1. CREATE WORKOUT ROUTINE
// ==========================================
const createWorkout = async (req, res) => {
    try {
        const { exerciseName, sets, reps, weights, notes, category, tags } = req.body;

        // Input Validations
        if (!exerciseName || !sets || !reps || !category) {
            return res.status(400).json({
                message: 'Exercise name, sets, reps, and category are required.'
            });
        }

        if (sets < 1 || reps < 1) {
            return res.status(400).json({
                message: 'Sets and reps must be at least 1.'
            });
        }

        if (weights !== undefined && weights < 0) {
            return res.status(400).json({
                message: 'Weights cannot be negative.'
            });
        }

        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({
                message: 'Tags must be an array of strings.'
            });
        }

        const newWorkout = new Workout({
            user: req.user.id,
            exerciseName,
            sets,
            reps,
            weights: weights || 0,
            notes: notes || '',
            category,
            tags: tags || []
        });

        await newWorkout.save();

        await createNotification(req.user.id, 'workout_completion', `You completed workout: ${exerciseName}`);

        res.status(201).json({
            message: 'Workout routine created successfully!',
            workout: newWorkout
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error creating workout' });
    }
};

// ==========================================
// 2. GET ALL WORKOUTS (With Category & Tag Filter)
// ==========================================
const getWorkouts = async (req, res) => {
    try {
        const { category, tag } = req.query;

        // Sirf logged-in user ke workouts layein
        let filter = { user: req.user.id };

        // Agar query mein category ya tag bheja jaye toh filter karein
        if (category) {
            filter.category = category.toLowerCase();
        }
        if (tag) {
            filter.tags = tag;
        }

        const workouts = await Workout.find(filter).sort({ createdAt: -1 });

        res.status(200).json(workouts);

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching workouts' });
    }
};

// ==========================================
// 3. EDIT / UPDATE WORKOUT ROUTINE
// ==========================================
const updateWorkout = async (req, res) => {
    try {
        const { id } = req.params;

        // Valid MongoDB ObjectId check
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid workout ID.' });
        }

        const workout = await Workout.findById(id);
        if (!workout) {
            return res.status(404).json({ message: 'Workout routine not found.' });
        }

        // Security Check: Kya yeh workout isi user ka hai?
        if (workout.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this workout.' });
        }

        const { exerciseName, sets, reps, weights, notes, category, tags } = req.body;

        // Field-by-field validation & update
        if (exerciseName !== undefined) {
            if (exerciseName.trim() === '') {
                return res.status(400).json({ message: 'Exercise name cannot be empty.' });
            }
            workout.exerciseName = exerciseName;
        }

        if (sets !== undefined) {
            if (sets < 1) return res.status(400).json({ message: 'Sets must be at least 1.' });
            workout.sets = sets;
        }

        if (reps !== undefined) {
            if (reps < 1) return res.status(400).json({ message: 'Reps must be at least 1.' });
            workout.reps = reps;
        }

        if (weights !== undefined) {
            if (weights < 0) return res.status(400).json({ message: 'Weights cannot be negative.' });
            workout.weights = weights;
        }

        if (notes !== undefined) {
            workout.notes = notes;
        }

        if (category !== undefined) {
            if (category.trim() === '') {
                return res.status(400).json({ message: 'Category cannot be empty.' });
            }
            workout.category = category;
        }

        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                return res.status(400).json({ message: 'Tags must be an array of strings.' });
            }
            workout.tags = tags;
        }

        await workout.save();

        res.status(200).json({
            message: 'Workout routine updated successfully!',
            workout
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error updating workout' });
    }
};

// ==========================================
// 4. DELETE WORKOUT ROUTINE
// ==========================================
const deleteWorkout = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid workout ID.' });
        }

        const workout = await Workout.findById(id);
        if (!workout) {
            return res.status(404).json({ message: 'Workout routine not found.' });
        }

        // Security Check: Ownership verify karein
        if (workout.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this workout.' });
        }

        await workout.deleteOne();

        res.status(200).json({ message: 'Workout routine deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting workout' });
    }
};

module.exports = {
    createWorkout,
    getWorkouts,
    updateWorkout,
    deleteWorkout
};