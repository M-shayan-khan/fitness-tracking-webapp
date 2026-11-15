const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Header se token lena (Format: Bearer <token>)
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Apni .env file mein JWT_SECRET lazmi rakhein
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Token se user ki ID req.user mein save kar di
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;