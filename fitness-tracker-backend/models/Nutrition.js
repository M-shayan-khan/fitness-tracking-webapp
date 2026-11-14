const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  foodItem: {
    type: String,
    required: [true, 'Please add a food item name']
  },
  calories: {
    type: Number,
    required: [true, 'Please add calorie count']
  },
  protein: {
    type: Number,
    default: 0 // in grams
  },
  carbs: {
    type: Number,
    default: 0 // in grams
  },
  fats: {
    type: Number,
    default: 0 // in grams
  },
  mealType: {
    type: String,
    required: [true, 'Please specify the meal type'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack']
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Nutrition = mongoose.model('Nutrition', nutritionSchema);
module.exports = Nutrition;