const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const User = require('../models/User');

// Helper: Regex special characters escape karne ke liye (taake invalid regex crash na ho)
const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// ==========================================
// 1. SEARCH & FILTER WORKOUTS
// ==========================================
const searchWorkouts = async (req, res) => {
    try {
        const { q, category, tag, minWeight, maxWeight, sortBy } = req.query;

        let filter = { user: req.user.id };

        // Keyword search (exerciseName, notes, ya tags mein)
        if (q && q.trim() !== '') {
            const regex = new RegExp(escapeRegex(q.trim()), 'i');
            filter.$or = [
                { exerciseName: regex },
                { notes: regex },
                { tags: regex }
            ];
        }

        // Narrow down filters
        if (category && category.trim() !== '') {
            filter.category = category.trim().toLowerCase();
        }

        if (tag && tag.trim() !== '') {
            filter.tags = tag.trim();
        }

        if (minWeight !== undefined || maxWeight !== undefined) {
            filter.weights = {};
            if (minWeight !== undefined) {
                const min = Number(minWeight);
                if (isNaN(min) || min < 0) {
                    return res.status(400).json({ message: 'minWeight must be a valid non-negative number.' });
                }
                filter.weights.$gte = min;
            }
            if (maxWeight !== undefined) {
                const max = Number(maxWeight);
                if (isNaN(max) || max < 0) {
                    return res.status(400).json({ message: 'maxWeight must be a valid non-negative number.' });
                }
                filter.weights.$lte = max;
            }
        }

        // Sorting validation & mapping
        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            weight_desc: { weights: -1 },
            weight_asc: { weights: 1 }
        };

        if (sortBy && !sortOptions[sortBy]) {
            return res.status(400).json({
                message: 'Invalid sortBy option. Use: newest, oldest, weight_desc, or weight_asc.'
            });
        }

        const sort = sortOptions[sortBy] || { createdAt: -1 };

        const workouts = await Workout.find(filter).sort(sort);

        res.status(200).json({
            count: workouts.length,
            workouts
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error searching workouts' });
    }
};

// ==========================================
// 2. SEARCH & FILTER NUTRITION ENTRIES
// ==========================================
const searchNutrition = async (req, res) => {
    try {
        const { q, mealType, minCalories, maxCalories, date, sortBy } = req.query;

        let filter = { user: req.user.id };

        // Keyword search (foodItem mein)
        if (q && q.trim() !== '') {
            const regex = new RegExp(escapeRegex(q.trim()), 'i');
            filter.foodItem = regex;
        }

        // Meal type filter validation
        const allowedMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
        if (mealType && mealType.trim() !== '') {
            if (!allowedMeals.includes(mealType.trim().toLowerCase())) {
                return res.status(400).json({
                    message: 'Invalid mealType. Use breakfast, lunch, dinner, or snacks.'
                });
            }
            filter.mealType = mealType.trim().toLowerCase();
        }

        // Calories range filter
        if (minCalories !== undefined || maxCalories !== undefined) {
            filter.calories = {};
            if (minCalories !== undefined) {
                const min = Number(minCalories);
                if (isNaN(min) || min < 0) {
                    return res.status(400).json({ message: 'minCalories must be a valid non-negative number.' });
                }
                filter.calories.$gte = min;
            }
            if (maxCalories !== undefined) {
                const max = Number(maxCalories);
                if (isNaN(max) || max < 0) {
                    return res.status(400).json({ message: 'maxCalories must be a valid non-negative number.' });
                }
                filter.calories.$lte = max;
            }
        }

        // Specific date filter (YYYY-MM-DD)
        if (date && date.trim() !== '') {
            const startOfDay = new Date(date);
            if (isNaN(startOfDay.getTime())) {
                return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
            }
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        // Sorting validation & mapping
        const sortOptions = {
            newest: { date: -1, createdAt: -1 },
            oldest: { date: 1, createdAt: 1 },
            calories_desc: { calories: -1 },
            calories_asc: { calories: 1 }
        };

        if (sortBy && !sortOptions[sortBy]) {
            return res.status(400).json({
                message: 'Invalid sortBy option. Use: newest, oldest, calories_desc, or calories_asc.'
            });
        }

        const sort = sortOptions[sortBy] || { date: -1, createdAt: -1 };

        const nutritionLogs = await Nutrition.find(filter).sort(sort);

        res.status(200).json({
            count: nutritionLogs.length,
            nutritionLogs
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error searching nutrition entries' });
    }
};

// ==========================================
// 3. SEARCH & FILTER OTHER USERS
// ==========================================
const searchUsers = async (req, res) => {
    try {
        const { q, sortBy } = req.query;

        // Logged-in user ko exclude karna taake sirf "other users" aayein
        let filter = { _id: { $ne: req.user.id } };

        // Username ya Name mein keyword search
        if (q && q.trim() !== '') {
            const regex = new RegExp(escapeRegex(q.trim()), 'i');
            filter.$or = [
                { username: regex },
                { name: regex }
            ];
        }

        // Sorting validation & mapping
        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 }
        };

        if (sortBy && !sortOptions[sortBy]) {
            return res.status(400).json({
                message: 'Invalid sortBy option. Use: newest, oldest, name_asc, or name_desc.'
            });
        }

        const sort = sortOptions[sortBy] || { createdAt: -1 };

        // Password aur email hide rakhna (sirf public profile info return karna)
        const users = await User.find(filter)
            .select('username name profilePicture createdAt')
            .sort(sort);

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error searching users' });
    }
};

module.exports = {
    searchWorkouts,
    searchNutrition,
    searchUsers
};