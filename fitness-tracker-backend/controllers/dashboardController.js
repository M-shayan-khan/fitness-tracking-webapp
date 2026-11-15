const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');

// ==========================================
// 1. GET USER DASHBOARD OVERVIEW (Existing)
// ==========================================
const getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        if (isNaN(limit) || limit < 1 || limit > 50) {
            return res.status(400).json({
                message: 'Limit must be a valid number between 1 and 50.'
            });
        }

        const [recentWorkouts, recentNutritionLogs, recentProgress] = await Promise.all([
            Workout.find({ user: userId }).sort({ createdAt: -1 }).limit(limit),
            Nutrition.find({ user: userId }).sort({ date: -1, createdAt: -1 }).limit(limit),
            Progress.find({ user: userId }).sort({ date: -1, createdAt: -1 }).limit(limit)
        ]);

        res.status(200).json({
            recentWorkouts,
            recentNutritionLogs,
            recentProgress
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching dashboard overview' });
    }
};

// ==========================================
// 2. WORKOUT ANALYTICS (Charts & Graphs Data)
// ==========================================
const getWorkoutAnalytics = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Optional days filter validation (default: last 30 days)
        const days = req.query.days ? parseInt(req.query.days) : 30;
        if (isNaN(days) || days < 1 || days > 365) {
            return res.status(400).json({
                message: 'Days parameter must be a number between 1 and 365.'
            });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // A. Progress in Lifting Weights (Date-wise max & average weight)
        const liftingProgress = await Workout.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: startDate },
                    weights: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        exerciseName: '$exerciseName'
                    },
                    maxWeight: { $max: '$weights' },
                    totalVolume: { $sum: { $multiply: ['$sets', '$reps', '$weights'] } }
                }
            },
            { $sort: { '_id.date': 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    exerciseName: '$_id.exerciseName',
                    maxWeight: 1,
                    totalVolume: 1
                }
            }
        ]);

        // B. Workout Frequency (Date-wise count + Category distribution)
        const workoutFrequency = await Workout.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    workoutsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    workoutsCount: 1
                }
            }
        ]);

        const categoryDistribution = await Workout.aggregate([
            { $match: { user: userId, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    count: 1
                }
            }
        ]);

        // C. Exercise History (Har exercise ka summary & records)
        const exerciseHistory = await Workout.aggregate([
            { $match: { user: userId } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$exerciseName',
                    totalSessions: { $sum: 1 },
                    maxWeightLifted: { $max: '$weights' },
                    lastPerformed: { $first: '$createdAt' },
                    recentSets: { $first: '$sets' },
                    recentReps: { $first: '$reps' }
                }
            },
            { $sort: { lastPerformed: -1 } },
            {
                $project: {
                    _id: 0,
                    exerciseName: '$_id',
                    totalSessions: 1,
                    maxWeightLifted: 1,
                    lastPerformed: 1,
                    recentSets: 1,
                    recentReps: 1
                }
            }
        ]);

        res.status(200).json({
            liftingProgress,
            workoutFrequency,
            categoryDistribution,
            exerciseHistory
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching workout analytics' });
    }
};

// ==========================================
// 3. NUTRITION ANALYTICS (Calories, Macros & Trends)
// ==========================================
const getNutritionAnalytics = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Optional days filter validation (default: last 30 days)
        const days = req.query.days ? parseInt(req.query.days) : 30;
        if (isNaN(days) || days < 1 || days > 365) {
            return res.status(400).json({
                message: 'Days parameter must be a number between 1 and 365.'
            });
        }

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // A. Daily Consumption Trends (Date-wise Calories & Macros)
        const dailyTrends = await Nutrition.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    totalCalories: { $sum: '$calories' },
                    totalProtein: { $sum: '$macros.protein' },
                    totalCarbs: { $sum: '$macros.carbs' },
                    totalFats: { $sum: '$macros.fats' },
                    mealsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    totalCalories: 1,
                    totalProtein: 1,
                    totalCarbs: 1,
                    totalFats: 1,
                    mealsCount: 1
                }
            }
        ]);

        // B. Overall Calorie Intake & Macronutrient Distribution
        const macroTotals = await Nutrition.aggregate([
            {
                $match: {
                    user: userId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCalories: { $sum: '$calories' },
                    totalProtein: { $sum: '$macros.protein' },
                    totalCarbs: { $sum: '$macros.carbs' },
                    totalFats: { $sum: '$macros.fats' }
                }
            }
        ]);

        const totals = macroTotals[0] || {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFats: 0
        };

        const totalMacroGrams = totals.totalProtein + totals.totalCarbs + totals.totalFats;

        const macronutrientDistribution = {
            proteinGrams: totals.totalProtein,
            carbsGrams: totals.totalCarbs,
            fatsGrams: totals.totalFats,
            proteinPercentage: totalMacroGrams > 0 ? Math.round((totals.totalProtein / totalMacroGrams) * 100) : 0,
            carbsPercentage: totalMacroGrams > 0 ? Math.round((totals.totalCarbs / totalMacroGrams) * 100) : 0,
            fatsPercentage: totalMacroGrams > 0 ? Math.round((totals.totalFats / totalMacroGrams) * 100) : 0
        };

        res.status(200).json({
            totalCalorieIntake: totals.totalCalories,
            macronutrientDistribution,
            dailyConsumptionTrends: dailyTrends
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching nutrition analytics' });
    }
};

module.exports = {
    getUserDashboard,
    getWorkoutAnalytics,
    getNutritionAnalytics
};