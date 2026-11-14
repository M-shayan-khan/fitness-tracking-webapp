const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Yeh User model ke sath link karega
  },
  exercise: {
    type: String,
    required: [true, 'Please add an exercise name']
  },
  category: {
    type: String,
    required: [true, 'Please add a category (e.g., Chest, Legs, Cardio)'],
    enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body']
  },
  tags: {
    type: [String], // Custom tags (e.g., ["heavy", "morning"])
    default: []
  },
  sets: {
    type: Number,
    default: 0 // Cardio ke liye sets zero ho sakte hain
  },
  reps: {
    type: Number,
    default: 0 // Cardio ke liye reps zero ho sakte hain
  },
  weight: {
    type: Number, // Weight in kg
    default: 0
  },
  duration: {
    type: Number, // <--- Duration in minutes (Cardio / HIIT ke liye bohot zaroori)
    default: 0
  },
  notes: { 
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;