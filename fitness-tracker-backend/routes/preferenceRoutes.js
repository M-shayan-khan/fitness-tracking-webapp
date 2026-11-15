const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getPreferences,
    updatePreferences
} = require('../controllers/preferenceController');

router.use(auth);

router.get('/', getPreferences);
router.put('/', updatePreferences);

module.exports = router;