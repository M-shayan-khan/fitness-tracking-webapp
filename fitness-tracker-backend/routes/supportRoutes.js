const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createSupportTicket,
    getMySupportTickets,
    updateSupportTicket,
    deleteSupportTicket
} = require('../controllers/supportController');

// Saare support routes protected hain
router.use(auth);

router.post('/', createSupportTicket);
router.get('/', getMySupportTickets);
router.put('/:id', updateSupportTicket);
router.delete('/:id', deleteSupportTicket);

module.exports = router;