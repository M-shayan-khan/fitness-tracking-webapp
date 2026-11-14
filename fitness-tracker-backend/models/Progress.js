const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  weight: {
    type: Number,
    required: [true, 'Please add your current weight']
  },
  bodyFatPercentage: {
    type: Number,
    default: null // optional
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;