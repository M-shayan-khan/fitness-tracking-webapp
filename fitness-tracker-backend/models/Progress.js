const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weight: {
        type: Number, // in kg or lbs
        required: [true, 'Weight is required'],
        min: [1, 'Weight must be greater than 0']
    },
    bodyMeasurements: {
        chest: {
            type: Number,
            min: [0, 'Chest measurement cannot be negative']
        },
        waist: {
            type: Number,
            min: [0, 'Waist measurement cannot be negative']
        },
        hips: {
            type: Number,
            min: [0, 'Hips measurement cannot be negative']
        },
        arms: {
            type: Number,
            min: [0, 'Arms measurement cannot be negative']
        },
        thighs: {
            type: Number,
            min: [0, 'Thighs measurement cannot be negative']
        }
    },
    performanceMetrics: {
        runTime: {
            type: Number, // e.g., in minutes
            min: [0, 'Run time cannot be negative']
        },
        liftingWeight: {
            type: Number, // e.g., max lift in kg
            min: [0, 'Lifting weight cannot be negative']
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);