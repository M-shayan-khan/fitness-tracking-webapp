const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
} = require('../controllers/authController');

// Public Routes
router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);

// Protected Routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, upload.single('profilePicture'), updateUserProfile);

module.exports = router;