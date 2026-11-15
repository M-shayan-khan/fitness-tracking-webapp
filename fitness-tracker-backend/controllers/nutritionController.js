const mongoose = require('mongoose');
const Nutrition = require('../models/Nutrition');

const ALLOWED_MEALS = ['breakfast', 'lunch', 'dinner', 'snacks'];

// ==========================================
// 1. LOG FOOD INTAKE (CREATE)
// ==========================================
const addNutritionLog = async (req, res) => {
    try {
        const { mealType, foodItem, quantity, calories, macros, date } = req.body;

        // Required fields validation
        if (!mealType || !foodItem || !quantity || calories === undefined) {
            return res.status(400).json({
                message: 'Meal type, food item, quantity, and calories are required.'
            });
        }

        // Meal type validation
        if (!ALLOWED_MEALS.includes(mealType.toLowerCase())) {
            return res.status(400).json({
                message: 'Meal type must be breakfast, lunch, dinner, or snacks.'
            });
        }

        // Calories validation
        if (typeof calories !== 'number' || calories < 0) {
            return res.status(400).json({
                message: 'Calories must be a non-negative number.'
            });
        }

        // Macros validation (agar macros bheje gaye hon)
        if (macros) {
            const { protein, carbs, fats } = macros;
            if ((protein !== undefined && protein < 0) ||
                (carbs !== undefined && carbs < 0) ||
                (fats !== undefined && fats < 0)) {
                return res.status(400).json({
                    message: 'Macros (protein, carbs, fats) cannot be negative.'
                });
            }
        }

        const newLog = new Nutrition({
            user: req.user.id,
            mealType: mealType.toLowerCase(),
            foodItem,
            quantity,
            calories,
            macros: {
                protein: macros?.protein || 0,
                carbs: macros?.carbs || 0,
                fats: macros?.fats || 0
            },
            date: date || Date.now()
        });

        await newLog.save();

        res.status(201).json({
            message: 'Food intake logged successfully!',
            nutritionLog: newLog
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error logging food intake' });
    }
};

// ==========================================
// 2. GET DAILY / ALL NUTRITION LOGS
// ==========================================
const getNutritionLogs = async (req, res) => {
    try {
        const { date, mealType } = req.query;
        let filter = { user: req.user.id };

        // Agar mealType query mein ho toh filter karein
        if (mealType) {
            if (!ALLOWED_MEALS.includes(mealType.toLowerCase())) {
                return res.status(400).json({
                    message: 'Invalid meal type filter. Use breakfast, lunch, dinner, or snacks.'
                });
            }
            filter.mealType = mealType.toLowerCase();
        }

        // Agar specific date (YYYY-MM-DD) bheji jaye toh us din ke logs layein
        if (date) {
            const startOfDay = new Date(date);
            if (isNaN(startOfDay.getTime())) {
                return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
            }
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const logs = await Nutrition.find(filter).sort({ date: -1 });

        res.status(200).json(logs);

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching nutrition logs' });
    }
};

// ==========================================
// 3. UPDATE NUTRITION LOG
// ==========================================
const updateNutritionLog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid nutrition log ID.' });
        }

        const log = await Nutrition.findById(id);
        if (!log) {
            return res.status(404).json({ message: 'Nutrition log not found.' });
        }

        // Ownership check
        if (log.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this entry.' });
        }

        const { mealType, foodItem, quantity, calories, macros, date } = req.body;

        if (mealType !== undefined) {
            if (!ALLOWED_MEALS.includes(mealType.toLowerCase())) {
                return res.status(400).json({
                    message: 'Meal type must be breakfast, lunch, dinner, or snacks.'
                });
            }
            log.mealType = mealType.toLowerCase();
        }

        if (foodItem !== undefined) {
            if (foodItem.trim() === '') {
                return res.status(400).json({ message: 'Food item cannot be empty.' });
            }
            log.foodItem = foodItem;
        }

        if (quantity !== undefined) {
            if (quantity.trim() === '') {
                return res.status(400).json({ message: 'Quantity cannot be empty.' });
            }
            log.quantity = quantity;
        }

        if (calories !== undefined) {
            if (typeof calories !== 'number' || calories < 0) {
                return res.status(400).json({ message: 'Calories must be a non-negative number.' });
            }
            log.calories = calories;
        }

        if (macros !== undefined) {
            if (macros.protein !== undefined) {
                if (macros.protein < 0) return res.status(400).json({ message: 'Protein cannot be negative.' });
                log.macros.protein = macros.protein;
            }
            if (macros.carbs !== undefined) {
                if (macros.carbs < 0) return res.status(400).json({ message: 'Carbs cannot be negative.' });
                log.macros.carbs = macros.carbs;
            }
            if (macros.fats !== undefined) {
                if (macros.fats < 0) return res.status(400).json({ message: 'Fats cannot be negative.' });
                log.macros.fats = macros.fats;
            }
        }

        if (date !== undefined) {
            log.date = date;
        }

        await log.save();

        res.status(200).json({
            message: 'Nutrition log updated successfully!',
            nutritionLog: log
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error updating nutrition log' });
    }
};

// ==========================================
// 4. DELETE NUTRITION LOG
// ==========================================
const deleteNutritionLog = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid nutrition log ID.' });
        }

        const log = await Nutrition.findById(id);
        if (!log) {
            return res.status(404).json({ message: 'Nutrition log not found.' });
        }

        // Ownership check
        if (log.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this entry.' });
        }

        await log.deleteOne();

        res.status(200).json({ message: 'Nutrition log deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting nutrition log' });
    }
};

module.exports = {
    addNutritionLog,
    getNutritionLogs,
    updateNutritionLog,
    deleteNutritionLog
};