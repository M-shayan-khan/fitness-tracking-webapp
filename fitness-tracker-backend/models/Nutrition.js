const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mealType: {
        type: String,
        required: [true, 'Meal type is required'],
        enum: {
            values: ['breakfast', 'lunch', 'dinner', 'snacks'],
            message: 'Meal type must be breakfast, lunch, dinner, or snacks'
        },
        lowercase: true,
        trim: true
    },
    foodItem: {
        type: String,
        required: [true, 'Food item name is required'],
        trim: true
    },
    quantity: {
        type: String, // e.g., "2 eggs", "150g", "1 bowl"
        required: [true, 'Quantity is required'],
        trim: true
    },
    calories: {
        type: Number,
        required: [true, 'Calories are required'],
        min: [0, 'Calories cannot be negative']
    },
    macros: {
        protein: {
            type: Number,
            default: 0,
            min: [0, 'Protein cannot be negative']
        },
        carbs: {
            type: Number,
            default: 0,
            min: [0, 'Carbs cannot be negative']
        },
        fats: {
            type: Number,
            default: 0,
            min: [0, 'Fats cannot be negative']
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Nutrition', nutritionSchema);