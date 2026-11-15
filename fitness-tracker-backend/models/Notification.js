const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: {
            values: ['workout_completion', 'goal_achievement', 'new_follower', 'forum_response'],
            message: 'Invalid notification type'
        }
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);