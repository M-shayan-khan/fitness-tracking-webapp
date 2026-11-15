const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: [true, 'Support type is required'],
        enum: {
            values: ['assistance', 'issue', 'feedback'],
            message: 'Type must be assistance, issue, or feedback'
        },
        lowercase: true,
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [150, 'Subject cannot exceed 150 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters long']
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved'],
        default: 'open',
        lowercase: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Support', supportSchema);