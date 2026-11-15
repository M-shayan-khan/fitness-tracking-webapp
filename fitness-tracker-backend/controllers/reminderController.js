const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');

const ALLOWED_TYPES = ['workout', 'meal', 'goal'];
const ALLOWED_DAYS = ['Daily', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper: HH:MM (24-hour) format validate karne ke liye (e.g., 07:30, 18:45)
const isValidTimeFormat = (time) => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// ==========================================
// 1. CREATE REMINDER / ALERT
// ==========================================
const createReminder = async (req, res) => {
    try {
        const { title, type, reminderTime, days, isActive } = req.body;

        // Required fields validation
        if (!title || !type || !reminderTime) {
            return res.status(400).json({
                message: 'Title, type, and reminderTime are required.'
            });
        }

        if (title.trim() === '') {
            return res.status(400).json({ message: 'Title cannot be empty.' });
        }

        // Type validation
        if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
            return res.status(400).json({
                message: 'Reminder type must be workout, meal, or goal.'
            });
        }

        // Time format validation
        if (!isValidTimeFormat(reminderTime.trim())) {
            return res.status(400).json({
                message: 'Invalid reminderTime format. Use 24-hour HH:MM format (e.g., "07:30" or "18:00").'
            });
        }

        // Days validation (agar array bheja jaye)
        if (days !== undefined) {
            if (!Array.isArray(days) || days.length === 0) {
                return res.status(400).json({ message: 'Days must be a non-empty array.' });
            }
            for (const day of days) {
                if (!ALLOWED_DAYS.includes(day)) {
                    return res.status(400).json({
                        message: `Invalid day "${day}". Allowed values: ${ALLOWED_DAYS.join(', ')}`
                    });
                }
            }
        }

        const newReminder = new Reminder({
            user: req.user.id,
            title: title.trim(),
            type: type.toLowerCase(),
            reminderTime: reminderTime.trim(),
            days: days || ['Daily'],
            isActive: isActive !== undefined ? Boolean(isActive) : true
        });

        await newReminder.save();

        res.status(201).json({
            message: 'Reminder created successfully!',
            reminder: newReminder
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error creating reminder' });
    }
};

// ==========================================
// 2. GET ALL REMINDERS FOR LOGGED-IN USER
// ==========================================
const getReminders = async (req, res) => {
    try {
        const { type, isActive } = req.query;
        let filter = { user: req.user.id };

        if (type) {
            if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
                return res.status(400).json({
                    message: 'Invalid type filter. Use workout, meal, or goal.'
                });
            }
            filter.type = type.toLowerCase();
        }

        if (isActive !== undefined) {
            if (isActive !== 'true' && isActive !== 'false') {
                return res.status(400).json({ message: 'isActive must be true or false.' });
            }
            filter.isActive = isActive === 'true';
        }

        const reminders = await Reminder.find(filter).sort({ reminderTime: 1 });

        res.status(200).json(reminders);

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching reminders' });
    }
};

// ==========================================
// 3. UPDATE REMINDER / ALERT
// ==========================================
const updateReminder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid reminder ID.' });
        }

        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found.' });
        }

        // Ownership check
        if (reminder.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this reminder.' });
        }

        const { title, type, reminderTime, days, isActive } = req.body;

        if (title !== undefined) {
            if (title.trim() === '') {
                return res.status(400).json({ message: 'Title cannot be empty.' });
            }
            reminder.title = title.trim();
        }

        if (type !== undefined) {
            if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
                return res.status(400).json({ message: 'Reminder type must be workout, meal, or goal.' });
            }
            reminder.type = type.toLowerCase();
        }

        if (reminderTime !== undefined) {
            if (!isValidTimeFormat(reminderTime.trim())) {
                return res.status(400).json({
                    message: 'Invalid reminderTime format. Use 24-hour HH:MM format (e.g., "07:30").'
                });
            }
            reminder.reminderTime = reminderTime.trim();
        }

        if (days !== undefined) {
            if (!Array.isArray(days) || days.length === 0) {
                return res.status(400).json({ message: 'Days must be a non-empty array.' });
            }
            for (const day of days) {
                if (!ALLOWED_DAYS.includes(day)) {
                    return res.status(400).json({
                        message: `Invalid day "${day}". Allowed values: ${ALLOWED_DAYS.join(', ')}`
                    });
                }
            }
            reminder.days = days;
        }

        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') {
                return res.status(400).json({ message: 'isActive must be a boolean (true or false).' });
            }
            reminder.isActive = isActive;
        }

        await reminder.save();

        res.status(200).json({
            message: 'Reminder updated successfully!',
            reminder
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error updating reminder' });
    }
};

// ==========================================
// 4. DELETE REMINDER / ALERT
// ==========================================
const deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid reminder ID.' });
        }

        const reminder = await Reminder.findById(id);
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found.' });
        }

        // Ownership check
        if (reminder.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this reminder.' });
        }

        await reminder.deleteOne();

        res.status(200).json({ message: 'Reminder deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting reminder' });
    }
};

module.exports = {
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder
};