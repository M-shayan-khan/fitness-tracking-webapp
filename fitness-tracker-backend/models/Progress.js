const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weight: {
    type: Number,
    required: true
  }, // in kg or lbs
  bodyMeasurements: {
    chest: {
      type: Number,
      default: 0
    },
    waist: {
      type: Number,
      default: 0
    },
    arms: {
      type: Number,
      default: 0
    },
    thighs: {
      type: Number,
      default: 0
    }
  },
  performanceMetrics: {
    runTimeMinutes: {
      type: Number,
      default: 0
    }, // e.g., 5km run time
    maxLiftWeight: {
      type: Number,
      default: 0
    }    // e.g., bench press max
  },
  date: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', progressSchema);