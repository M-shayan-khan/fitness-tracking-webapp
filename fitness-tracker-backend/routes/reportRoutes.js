const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { exportReport } = require('../controllers/reportController');

router.use(auth);

router.get('/export', exportReport);

module.exports = router;