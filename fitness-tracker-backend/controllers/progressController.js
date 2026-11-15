const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const { createNotification } = require('./notificationController');

// ==========================================
// 1. RECORD FITNESS PROGRESS (CREATE)
// ==========================================
const addProgress = async (req, res) => {
    try {
        const { weight, bodyMeasurements, performanceMetrics, date } = req.body;

        // Weight validation
        if (weight === undefined || typeof weight !== 'number' || weight <= 0) {
            return res.status(400).json({
                message: 'Valid weight (greater than 0) is required.'
            });
        }

        // Body measurements negative check
        if (bodyMeasurements) {
            const fields = ['chest', 'waist', 'hips', 'arms', 'thighs'];
            for (const field of fields) {
                if (bodyMeasurements[field] !== undefined && bodyMeasurements[field] < 0) {
                    return res.status(400).json({
                        message: `${field} measurement cannot be negative.`
                    });
                }
            }
        }

        // Performance metrics negative check
        if (performanceMetrics) {
            if (performanceMetrics.runTime !== undefined && performanceMetrics.runTime < 0) {
                return res.status(400).json({ message: 'Run time cannot be negative.' });
            }
            if (performanceMetrics.liftingWeight !== undefined && performanceMetrics.liftingWeight < 0) {
                return res.status(400).json({ message: 'Lifting weight cannot be negative.' });
            }
        }

        const newProgress = new Progress({
            user: req.user.id,
            weight,
            bodyMeasurements: bodyMeasurements || {},
            performanceMetrics: performanceMetrics || {},
            date: date || Date.now()
        });

        await newProgress.save();

        await createNotification(req.user.id, 'goal_achievement', `New fitness progress recorded! Current weight: ${weight}kg`);

        res.status(201).json({
            message: 'Progress recorded successfully!',
            progress: newProgress
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error recording progress' });
    }
};

// ==========================================
// 2. GET ALL PROGRESS ENTRIES
// ==========================================
const getProgressHistory = async (req, res) => {
    try {
        const records = await Progress.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching progress history' });
    }
};

// ==========================================
// 3. GET GRAPH / VISUALIZATION DATA OVER TIME
// ==========================================
const getProgressChartData = async (req, res) => {
    try {
        // Graph ke liye purani date se nayi date (ascending order) mein data chahiye hota hai
        const records = await Progress.find({ user: req.user.id }).sort({ date: 1 });

        // Frontend graph libraries (Chart.js / Recharts) ke liye clean arrays format karna
        const chartData = records.map(entry => ({
            date: entry.date.toISOString().split('T')[0], // YYYY-MM-DD
            weight: entry.weight,
            chest: entry.bodyMeasurements?.chest || null,
            waist: entry.bodyMeasurements?.waist || null,
            hips: entry.bodyMeasurements?.hips || null,
            arms: entry.bodyMeasurements?.arms || null,
            thighs: entry.bodyMeasurements?.thighs || null,
            runTime: entry.performanceMetrics?.runTime || null,
            liftingWeight: entry.performanceMetrics?.liftingWeight || null
        }));

        res.status(200).json(chartData);

    } catch (error) {
        res.status(500).json({ message: 'Server Error generating graph data' });
    }
};

// ==========================================
// 4. UPDATE PROGRESS ENTRY
// ==========================================
const updateProgress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid progress ID.' });
        }

        const record = await Progress.findById(id);
        if (!record) {
            return res.status(404).json({ message: 'Progress entry not found.' });
        }

        // Ownership check
        if (record.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this entry.' });
        }

        const { weight, bodyMeasurements, performanceMetrics, date } = req.body;

        if (weight !== undefined) {
            if (typeof weight !== 'number' || weight <= 0) {
                return res.status(400).json({ message: 'Weight must be greater than 0.' });
            }
            record.weight = weight;
        }

        if (bodyMeasurements !== undefined) {
            const fields = ['chest', 'waist', 'hips', 'arms', 'thighs'];
            for (const field of fields) {
                if (bodyMeasurements[field] !== undefined) {
                    if (bodyMeasurements[field] < 0) {
                        return res.status(400).json({ message: `${field} measurement cannot be negative.` });
                    }
                    record.bodyMeasurements[field] = bodyMeasurements[field];
                }
            }
        }

        if (performanceMetrics !== undefined) {
            if (performanceMetrics.runTime !== undefined) {
                if (performanceMetrics.runTime < 0) return res.status(400).json({ message: 'Run time cannot be negative.' });
                record.performanceMetrics.runTime = performanceMetrics.runTime;
            }
            if (performanceMetrics.liftingWeight !== undefined) {
                if (performanceMetrics.liftingWeight < 0) return res.status(400).json({ message: 'Lifting weight cannot be negative.' });
                record.performanceMetrics.liftingWeight = performanceMetrics.liftingWeight;
            }
        }

        if (date !== undefined) {
            record.date = date;
        }

        await record.save();

        res.status(200).json({
            message: 'Progress entry updated successfully!',
            progress: record
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error updating progress' });
    }
};

// ==========================================
// 5. DELETE PROGRESS ENTRY
// ==========================================
const deleteProgress = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid progress ID.' });
        }

        const record = await Progress.findById(id);
        if (!record) {
            return res.status(404).json({ message: 'Progress entry not found.' });
        }

        // Ownership check
        if (record.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this entry.' });
        }

        await record.deleteOne();

        res.status(200).json({ message: 'Progress entry deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting progress' });
    }
};

module.exports = {
    addProgress,
    getProgressHistory,
    getProgressChartData,
    updateProgress,
    deleteProgress
};