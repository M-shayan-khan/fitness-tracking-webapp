const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exerciseName: {
        type: String,
        required: [true, 'Exercise name is required'],
        trim: true
    },
    sets: {
        type: Number,
        required: [true, 'Sets count is required'],
        min: [1, 'Sets must be at least 1']
    },
    reps: {
        type: Number,
        required: [true, 'Reps count is required'],
        min: [1, 'Reps must be at least 1']
    },
    weights: {
        type: Number,
        default: 0, // Bodyweight exercises (jaise pushups) ke liye 0 ho sakta hai
        min: [0, 'Weight cannot be negative']
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Workout category is required'],
        trim: true,
        lowercase: true // e.g., strength, cardio, flexibility
    },
    tags: {
        type: [String], // Array of strings e.g., ["chest", "morning", "push-day"]
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);