const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Preference = require('../models/Preference');

// Helper function taake Register aur Login dono mein clean tareeqe se token bane
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '5d'
    });
};

// ==========================================
// 1. REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
    try {
        const { username, name, email, password } = req.body;

        // Basic Input Validations
        if (!username || !name || !email || !password) {
            return res.status(400).json({ message: 'All fields (username, name, email, password) are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        // Duplicate check
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Email already exists.' });
        }

        // Password hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Profile picture check
        const profilePicture = req.file ? req.file.path : 'default-avatar.png';

        // Create user
        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword,
            profilePicture
        });

        await newUser.save();

        await Preference.create({ user: newUser._id });

        // Ab Register par bhi token generate hoga
        const token = generateToken(newUser._id);

        res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                name: newUser.name,
                email: newUser.email,
                profilePicture: newUser.profilePicture
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error during registration' });
    }
};

// ==========================================
// 2. LOGIN USER
// ==========================================
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password.' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error during login' });
    }
};

// ==========================================
// 3. GET USER PROFILE
// ==========================================
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching profile' });
    }
};

// ==========================================
// 4. UPDATE USER PROFILE
// ==========================================
const updateUserProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'This email is already in use.' });
            }
            user.email = email;
        }

        if (name) {
            if (name.trim() === '') {
                return res.status(400).json({ message: 'Name cannot be empty.' });
            }
            user.name = name;
        }

        if (req.file) {
            user.profilePicture = req.file.path;
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error updating profile' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
};