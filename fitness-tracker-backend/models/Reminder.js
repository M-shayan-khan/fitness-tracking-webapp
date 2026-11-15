const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Reminder title is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Reminder type is required'],
        enum: {
            values: ['workout', 'meal', 'goal'],
            message: 'Reminder type must be workout, meal, or goal'
        },
        lowercase: true,
        trim: true
    },
    reminderTime: {
        type: String, // e.g., "08:00" (HH:MM 24-hour format)
        required: [true, 'Reminder time is required'],
        trim: true
    },
    days: {
        type: [String], // e.g., ["Monday", "Wednesday", "Friday"] ya ["Daily"]
        default: ['Daily']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);