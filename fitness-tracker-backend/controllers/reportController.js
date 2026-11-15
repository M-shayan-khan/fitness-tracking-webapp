const PDFDocument = require('pdfkit');
const Progress = require('../models/Progress');
const Nutrition = require('../models/Nutrition');
const User = require('../models/User');

// Helper: Array of objects ko clean CSV string mein convert karne ke liye
const convertToCSV = (headers, rows) => {
    const headerLine = headers.join(',');
    const dataLines = rows.map(row =>
        row.map(value => {
            const str = value !== null && value !== undefined ? String(value) : '';
            // Agar value mein comma ya quotes hon toh safely wrap karein
            return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
    );
    return [headerLine, ...dataLines].join('\n');
};

// ==========================================
// GENERATE & EXPORT REPORT (PDF / CSV)
// ==========================================
const exportReport = async (req, res) => {
    try {
        const { type, format, startDate, endDate } = req.query;

        // 1. Validations
        if (!type || !['progress', 'nutrition'].includes(type.toLowerCase())) {
            return res.status(400).json({
                message: 'Invalid or missing "type". Allowed values: progress, nutrition.'
            });
        }

        if (!format || !['pdf', 'csv'].includes(format.toLowerCase())) {
            return res.status(400).json({
                message: 'Invalid or missing "format". Allowed values: pdf, csv.'
            });
        }

        const reportType = type.toLowerCase();
        const exportFormat = format.toLowerCase();

        // Date filter (optional)
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) {
                const start = new Date(startDate);
                if (isNaN(start.getTime())) {
                    return res.status(400).json({ message: 'Invalid startDate format. Use YYYY-MM-DD.' });
                }
                start.setHours(0, 0, 0, 0);
                dateFilter.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    return res.status(400).json({ message: 'Invalid endDate format. Use YYYY-MM-DD.' });
                }
                end.setHours(23, 59, 59, 999);
                dateFilter.date.$lte = end;
            }
        }

        const user = await User.findById(req.user.id).select('name username email');

        // ==========================================
        // CASE A: FITNESS PROGRESS REPORT
        // ==========================================
        if (reportType === 'progress') {
            const records = await Progress.find({ user: req.user.id, ...dateFilter }).sort({ date: -1 });

            if (records.length === 0) {
                return res.status(404).json({ message: 'No progress records found to export.' });
            }

            // --- CSV EXPORT ---
            if (exportFormat === 'csv') {
                const headers = ['Date', 'Weight (kg)', 'Chest', 'Waist', 'Hips', 'Arms', 'Thighs', 'Run Time (min)', 'Lifting Weight (kg)'];
                const rows = records.map(r => [
                    r.date.toISOString().split('T')[0],
                    r.weight,
                    r.bodyMeasurements?.chest || '-',
                    r.bodyMeasurements?.waist || '-',
                    r.bodyMeasurements?.hips || '-',
                    r.bodyMeasurements?.arms || '-',
                    r.bodyMeasurements?.thighs || '-',
                    r.performanceMetrics?.runTime || '-',
                    r.performanceMetrics?.liftingWeight || '-'
                ]);

                const csvContent = convertToCSV(headers, rows);

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="fitness-progress-report.csv"');
                return res.status(200).send(csvContent);
            }

            // --- PDF EXPORT ---
            if (exportFormat === 'pdf') {
                const doc = new PDFDocument({ margin: 40 });
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="fitness-progress-report.pdf"');
                doc.pipe(res);

                // Header
                doc.fontSize(20).text('Fitness Progress Report', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(11).text(`User: ${user.name} (@${user.username})`);
                doc.text(`Generated On: ${new Date().toISOString().split('T')[0]}`);
                doc.moveDown(1);

                // Records
                records.forEach((r, index) => {
                    const dateStr = r.date.toISOString().split('T')[0];
                    doc.fontSize(12).text(`${index + 1}. Date: ${dateStr} | Weight: ${r.weight} kg`, { underline: true });
                    doc.fontSize(10).text(
                        `   Body Measurements -> Chest: ${r.bodyMeasurements?.chest || '-'}, Waist: ${r.bodyMeasurements?.waist || '-'}, Hips: ${r.bodyMeasurements?.hips || '-'}, Arms: ${r.bodyMeasurements?.arms || '-'}, Thighs: ${r.bodyMeasurements?.thighs || '-'}`
                    );
                    doc.text(
                        `   Performance -> Run Time: ${r.performanceMetrics?.runTime || '-'} min | Max Lift: ${r.performanceMetrics?.liftingWeight || '-'} kg`
                    );
                    doc.moveDown(0.7);
                });

                doc.end();
                return;
            }
        }

        // ==========================================
        // CASE B: NUTRITION DATA REPORT
        // ==========================================
        if (reportType === 'nutrition') {
            const logs = await Nutrition.find({ user: req.user.id, ...dateFilter }).sort({ date: -1 });

            if (logs.length === 0) {
                return res.status(404).json({ message: 'No nutrition logs found to export.' });
            }

            // --- CSV EXPORT ---
            if (exportFormat === 'csv') {
                const headers = ['Date', 'Meal Type', 'Food Item', 'Quantity', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)'];
                const rows = logs.map(l => [
                    l.date.toISOString().split('T')[0],
                    l.mealType,
                    l.foodItem,
                    l.quantity,
                    l.calories,
                    l.macros?.protein || 0,
                    l.macros?.carbs || 0,
                    l.macros?.fats || 0
                ]);

                const csvContent = convertToCSV(headers, rows);

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="nutrition-report.csv"');
                return res.status(200).send(csvContent);
            }

            // --- PDF EXPORT ---
            if (exportFormat === 'pdf') {
                const doc = new PDFDocument({ margin: 40 });
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="nutrition-report.pdf"');
                doc.pipe(res);

                // Header
                doc.fontSize(20).text('Nutrition Intake Report', { align: 'center' });
                doc.moveDown(0.5);
                doc.fontSize(11).text(`User: ${user.name} (@${user.username})`);
                doc.text(`Generated On: ${new Date().toISOString().split('T')[0]}`);
                doc.moveDown(1);

                // Logs
                logs.forEach((l, index) => {
                    const dateStr = l.date.toISOString().split('T')[0];
                    doc.fontSize(12).text(`${index + 1}. [${dateStr}] ${l.mealType.toUpperCase()} - ${l.foodItem} (${l.quantity})`, { underline: true });
                    doc.fontSize(10).text(
                        `   Calories: ${l.calories} kcal | Protein: ${l.macros?.protein || 0}g | Carbs: ${l.macros?.carbs || 0}g | Fats: ${l.macros?.fats || 0}g`
                    );
                    doc.moveDown(0.7);
                });

                doc.end();
                return;
            }
        }

    } catch (error) {
        res.status(500).json({ message: 'Server Error generating report' });
    }
};

module.exports = {
    exportReport
};