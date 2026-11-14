const Nutrition = require('../models/Nutrition');

// @desc    Get all nutrition records for logged-in user
// @route   GET /api/nutrition
// @access  Private
const getNutritionRecords = async (req, res) => {
    try {
        const records = await Nutrition.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new nutrition/meal record
// @route   POST /api/nutrition
// @access  Private
const addNutritionRecord = async (req, res) => {
    try {
        const { foodItem, calories, protein, carbs, fats, mealType } = req.body;

        if (!foodItem || !calories || !mealType) {
            return res.status(400).json({ message: 'Please fill in all required fields (foodItem, calories, mealType)' });
        }

        const record = await Nutrition.create({
            user: req.user._id,
            foodItem,
            calories,
            protein: protein || 0,
            carbs: carbs || 0,
            fats: fats || 0,
            mealType
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a nutrition record
// @route   DELETE /api/nutrition/:id
// @access  Private
const deleteNutritionRecord = async (req, res) => {
    try {
        const record = await Nutrition.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ message: 'Nutrition record not found' });
        }

        // Check karo ke yeh record usi user ka hai ya nahi
        if (record.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await record.deleteOne();
        res.status(200).json({ message: 'Nutrition record removed', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get daily total calories & macros summary
// @route   GET /api/nutrition/summary
// @access  Private
const getNutritionSummary = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const summary = await Nutrition.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCalories: { $sum: '$calories' },
                    totalProtein: { $sum: '$protein' },
                    totalCarbs: { $sum: '$carbs' },
                    totalFats: { $sum: '$fats' },
                    totalMealsLogged: { $sum: 1 }
                }
            }
        ]);

        // Agar aaj koi meal log nahi hua toh 0 defaults bhej do
        if (summary.length === 0) {
            return res.status(200).json({
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFats: 0,
                totalMealsLogged: 0
            });
        }

        res.status(200).json(summary[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNutritionRecords,
    addNutritionRecord,
    deleteNutritionRecord,
    getNutritionSummary
};