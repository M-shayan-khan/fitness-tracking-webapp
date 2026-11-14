const PDFDocument = require('pdfkit');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');

// @desc    Get overall dashboard analytics & stats summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Total Workouts Count
    const totalWorkouts = await Workout.countDocuments({ user: userId });

    // 2. Today's Calories & Macros
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayNutrition = await Nutrition.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFats: { $sum: '$fats' }
        }
      }
    ]);

    // 3. Weight Overview (First & Current Weight)
    const weightProgress = await Progress.find({ user: userId }).sort({ date: 1 });

    const startWeight = weightProgress.length > 0 ? weightProgress[0].weight : null;
    const currentWeight = weightProgress.length > 0 ? weightProgress[weightProgress.length - 1].weight : null;

    res.status(200).json({
      totalWorkouts,
      todayNutrition: todayNutrition.length > 0 ? todayNutrition[0] : {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0
      },
      weightSummary: {
        startWeight,
        currentWeight,
        weightChange: (startWeight && currentWeight) ? (currentWeight - startWeight).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export Workout logs as CSV file
// @route   GET /api/dashboard/export/workouts
// @access  Private
const exportWorkoutsCSV = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 });

    // CSV Header row
    let csv = 'Title,Exercise Type,Sets,Reps,Weight (kg),Duration (mins),Date\n';

    // CSV Data rows
    workouts.forEach((w) => {
      const title = `"${w.title || ''}"`;
      const type = `"${w.exerciseType || ''}"`;
      const sets = w.sets || 0;
      const reps = w.reps || 0;
      const weight = w.weight || 0;
      const duration = w.duration || 0;
      const date = w.date ? new Date(w.date).toISOString().split('T')[0] : '';

      csv += `${title},${type},${sets},${reps},${weight},${duration},${date}\n`;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=workout_logs.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export Workout logs as PDF file
// @route   GET /api/dashboard/export/workouts-pdf
// @access  Private
const exportWorkoutsPDF = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1 });

    const doc = new PDFDocument({ margin: 30 });

    // Response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=workout_logs.pdf');

    doc.pipe(res);

    // PDF Header / Title
    doc.fontSize(20).text('Fitness Tracker - Workout Logs', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated for User: ${req.user.name || req.user.email}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(10).fillColor('blue').text('Title | Exercise | Sets | Reps | Weight(kg) | Duration(m) | Date');
    doc.fillColor('black').text('---------------------------------------------------------------------------------------------------');
    doc.moveDown(0.5);

    // Workout Rows
    if (workouts.length === 0) {
      doc.text('No workout logs found.');
    } else {
      workouts.forEach((w, index) => {
        const title = w.title || 'N/A';
        const type = w.exerciseType || 'N/A';
        const sets = w.sets || 0;
        const reps = w.reps || 0;
        const weight = w.weight || 0;
        const duration = w.duration || 0;
        const date = w.date ? new Date(w.date).toISOString().split('T')[0] : 'N/A';

        doc.text(`${index + 1}. ${title} | ${type} | ${sets} sets | ${reps} reps | ${weight} kg | ${duration} mins | ${date}`);
      });
    }

    // Finalize PDF file
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  exportWorkoutsCSV,
  exportWorkoutsPDF
};