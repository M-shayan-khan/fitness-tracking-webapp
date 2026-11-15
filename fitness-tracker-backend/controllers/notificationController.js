const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// Helper function (workout/progress/social controllers mein call karne ke liye)
const createNotification = async (userId, type, message) => {
    try {
        await Notification.create({
            user: userId,
            type,
            message
        });
    } catch (error) {
        console.error('Notification creation failed:', error.message);
    }
};

// ==========================================
// 1. GET ALL NOTIFICATIONS FOR LOGGED-IN USER
// ==========================================
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.status(200).json({
            unreadCount,
            notifications
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching notifications' });
    }
};

// ==========================================
// 2. MARK SINGLE NOTIFICATION AS READ
// ==========================================
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid notification ID.' });
        }

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        // Ownership check
        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this notification.' });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            message: 'Notification marked as read.',
            notification
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error updating notification' });
    }
};

// ==========================================
// 3. MARK ALL NOTIFICATIONS AS READ
// ==========================================
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: 'All notifications marked as read.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error marking all notifications as read' });
    }
};

// ==========================================
// 4. DELETE NOTIFICATION
// ==========================================
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid notification ID.' });
        }

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this notification.' });
        }

        await notification.deleteOne();

        res.status(200).json({ message: 'Notification deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting notification' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};