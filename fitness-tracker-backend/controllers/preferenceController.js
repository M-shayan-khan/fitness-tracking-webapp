const Preference = require('../models/Preference');

const ALLOWED_UNITS = ['metric', 'imperial'];
const ALLOWED_THEMES = ['light', 'dark', 'system'];

// ==========================================
// 1. GET USER PREFERENCES
// ==========================================
const getPreferences = async (req, res) => {
    try {
        let preferences = await Preference.findOne({ user: req.user.id });

        // Agar purana user hai aur preference doc nahi bani thi, toh default create kar dein
        if (!preferences) {
            preferences = await Preference.create({ user: req.user.id });
        }

        res.status(200).json(preferences);

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching preferences' });
    }
};

// ==========================================
// 2. UPDATE USER PREFERENCES
// ==========================================
const updatePreferences = async (req, res) => {
    try {
        const { notifications, units, theme } = req.body;

        let preferences = await Preference.findOne({ user: req.user.id });
        if (!preferences) {
            preferences = new Preference({ user: req.user.id });
        }

        // Notifications validation & update
        if (notifications !== undefined) {
            if (typeof notifications !== 'object' || Array.isArray(notifications)) {
                return res.status(400).json({ message: 'Notifications must be an object with push, email, and reminders.' });
            }
            if (notifications.push !== undefined) {
                if (typeof notifications.push !== 'boolean') return res.status(400).json({ message: 'notifications.push must be boolean.' });
                preferences.notifications.push = notifications.push;
            }
            if (notifications.email !== undefined) {
                if (typeof notifications.email !== 'boolean') return res.status(400).json({ message: 'notifications.email must be boolean.' });
                preferences.notifications.email = notifications.email;
            }
            if (notifications.reminders !== undefined) {
                if (typeof notifications.reminders !== 'boolean') return res.status(400).json({ message: 'notifications.reminders must be boolean.' });
                preferences.notifications.reminders = notifications.reminders;
            }
        }

        // Units validation & update
        if (units !== undefined) {
            if (!ALLOWED_UNITS.includes(units.toLowerCase())) {
                return res.status(400).json({ message: 'Units must be metric or imperial.' });
            }
            preferences.units = units.toLowerCase();
        }

        // Theme validation & update
        if (theme !== undefined) {
            if (!ALLOWED_THEMES.includes(theme.toLowerCase())) {
                return res.status(400).json({ message: 'Theme must be light, dark, or system.' });
            }
            preferences.theme = theme.toLowerCase();
        }

        await preferences.save();

        res.status(200).json({
            message: 'Preferences updated successfully!',
            preferences
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error updating preferences' });
    }
};

module.exports = {
    getPreferences,
    updatePreferences
};