const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Har user ki sirf ek hi preference document hogi
    },
    notifications: {
        push: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true }
    },
    units: {
        type: String,
        enum: {
            values: ['metric', 'imperial'],
            message: 'Units must be metric or imperial'
        },
        default: 'metric',
        lowercase: true,
        trim: true
    },
    theme: {
        type: String,
        enum: {
            values: ['light', 'dark', 'system'],
            message: 'Theme must be light, dark, or system'
        },
        default: 'dark',
        lowercase: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Preference', preferenceSchema);