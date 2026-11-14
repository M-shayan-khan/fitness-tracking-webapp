const Progress = require('../models/Progress');

// @desc    Get all progress records for logged-in user
// @route   GET /api/progress
// @access  Private
const getProgressRecords = async (req, res) => {
    try {
        const records = await Progress.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new progress record (weight/body fat update)
// @route   POST /api/progress
// @access  Private
const addProgressRecord = async (req, res) => {
    try {
        const { weight, bodyFatPercentage, notes, date } = req.body;

        if (!weight) {
            return res.status(400).json({ message: 'Please provide your current weight' });
        }

        const record = await Progress.create({
            user: req.user._id,
            weight,
            bodyFatPercentage: bodyFatPercentage || null,
            notes: notes || '',
            date: date || Date.now()
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a progress record
// @route   DELETE /api/progress/:id
// @access  Private
const deleteProgressRecord = async (req, res) => {
    try {
        const record = await Progress.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ message: 'Progress record not found' });
        }

        // Check karo ke yeh record usi user ka hai ya nahi
        if (record.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await record.deleteOne();
        res.status(200).json({ message: 'Progress record removed', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get weight trends & performance analytics for charts
// @route   GET /api/progress/analytics
// @access  Private
const getProgressAnalytics = async (req, res) => {
    try {
        const analytics = await Progress.aggregate([
            {
                $match: { user: req.user._id }
            },
            {
                $group: {
                    _id: null,
                    startWeight: { $first: '$weight' },
                    currentWeight: { $last: '$weight' },
                    minWeight: { $min: '$weight' },
                    maxWeight: { $max: '$weight' },
                    avgBodyFat: { $avg: '$bodyFatPercentage' },
                    totalLogs: { $sum: 1 }
                }
            }
        ]);

        if (analytics.length === 0) {
            return res.status(200).json({
                message: "No progress logs found yet",
                totalLogs: 0
            });
        }

        res.status(200).json(analytics[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProgressRecords,
    addProgressRecord,
    deleteProgressRecord,
    getProgressAnalytics
};