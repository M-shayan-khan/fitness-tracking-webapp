const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder
} = require('../controllers/reminderController');

// Saare reminder routes protected hain
router.use(auth);

router.post('/', createReminder);
router.get('/', getReminders);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;