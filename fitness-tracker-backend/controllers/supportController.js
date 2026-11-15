const mongoose = require('mongoose');
const Support = require('../models/Support');

const ALLOWED_TYPES = ['assistance', 'issue', 'feedback'];
const ALLOWED_STATUSES = ['open', 'in-progress', 'resolved'];

// ==========================================
// 1. SUBMIT SUPPORT REQUEST / ISSUE / FEEDBACK
// ==========================================
const createSupportTicket = async (req, res) => {
    try {
        const { type, subject, message } = req.body;

        // Required fields validation
        if (!type || !subject || !message) {
            return res.status(400).json({
                message: 'Type, subject, and message are required.'
            });
        }

        // Type validation
        if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
            return res.status(400).json({
                message: 'Type must be assistance, issue, or feedback.'
            });
        }

        if (subject.trim() === '' || subject.trim().length > 150) {
            return res.status(400).json({
                message: 'Subject must be between 1 and 150 characters.'
            });
        }

        if (message.trim().length < 10) {
            return res.status(400).json({
                message: 'Message must be at least 10 characters long.'
            });
        }

        const newTicket = new Support({
            user: req.user.id,
            type: type.toLowerCase(),
            subject: subject.trim(),
            message: message.trim()
        });

        await newTicket.save();

        res.status(201).json({
            message: 'Your support request has been submitted successfully!',
            ticket: newTicket
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error submitting support request' });
    }
};

// ==========================================
// 2. GET ALL SUPPORT TICKETS FOR LOGGED-IN USER
// ==========================================
const getMySupportTickets = async (req, res) => {
    try {
        const { type, status } = req.query;
        let filter = { user: req.user.id };

        if (type) {
            if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
                return res.status(400).json({
                    message: 'Invalid type filter. Use assistance, issue, or feedback.'
                });
            }
            filter.type = type.toLowerCase();
        }

        if (status) {
            if (!ALLOWED_STATUSES.includes(status.toLowerCase())) {
                return res.status(400).json({
                    message: 'Invalid status filter. Use open, in-progress, or resolved.'
                });
            }
            filter.status = status.toLowerCase();
        }

        const tickets = await Support.find(filter).sort({ createdAt: -1 });

        res.status(200).json(tickets);

    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching support tickets' });
    }
};

// ==========================================
// 3. UPDATE SUPPORT TICKET
// ==========================================
const updateSupportTicket = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ticket ID.' });
        }

        const ticket = await Support.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Support ticket not found.' });
        }

        // Ownership check
        if (ticket.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this ticket.' });
        }

        const { type, subject, message, status } = req.body;

        if (type !== undefined) {
            if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
                return res.status(400).json({ message: 'Type must be assistance, issue, or feedback.' });
            }
            ticket.type = type.toLowerCase();
        }

        if (subject !== undefined) {
            if (subject.trim() === '' || subject.trim().length > 150) {
                return res.status(400).json({ message: 'Subject must be between 1 and 150 characters.' });
            }
            ticket.subject = subject.trim();
        }

        if (message !== undefined) {
            if (message.trim().length < 10) {
                return res.status(400).json({ message: 'Message must be at least 10 characters long.' });
            }
            ticket.message = message.trim();
        }

        if (status !== undefined) {
            if (!ALLOWED_STATUSES.includes(status.toLowerCase())) {
                return res.status(400).json({ message: 'Status must be open, in-progress, or resolved.' });
            }
            ticket.status = status.toLowerCase();
        }

        await ticket.save();

        res.status(200).json({
            message: 'Support ticket updated successfully!',
            ticket
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error updating support ticket' });
    }
};

// ==========================================
// 4. DELETE SUPPORT TICKET
// ==========================================
const deleteSupportTicket = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ticket ID.' });
        }

        const ticket = await Support.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Support ticket not found.' });
        }

        // Ownership check
        if (ticket.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this ticket.' });
        }

        await ticket.deleteOne();

        res.status(200).json({ message: 'Support ticket deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting support ticket' });
    }
};

module.exports = {
    createSupportTicket,
    getMySupportTickets,
    updateSupportTicket,
    deleteSupportTicket
};