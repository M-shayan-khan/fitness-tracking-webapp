const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');

// Route Imports
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const supportRoutes = require('./routes/supportRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');

dotenv.config();
connectDB();

const morgan = require('morgan');
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads')); // Uploaded profile pictures ke liye

// Morgan logger (Development ke liye 'dev' format best hai jo method, route, status code aur response time print karta hai)
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined')); // Production ke liye detailed logs
} else {
    app.use(morgan('dev')); // Development ke liye color-coded short logs
}

// ROUTES MIDDLEWARE
app.use('/api/auth', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/preferences', preferenceRoutes);

app.get('/', (req, res) => {
  res.send('Fitness Tracker API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));