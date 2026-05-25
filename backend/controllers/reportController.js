// backend/controllers/reportController.js
const db = require('../config/db');

// Create a flag/report
exports.createReport = async (req, res, next) => {
  try {
    const { reported_user_id = null, book_id = null, reason, description } = req.body;
    const reporter_id = req.user.id;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const result = await db.query(
      `INSERT INTO reports (reporter_id, reported_user_id, book_id, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [reporter_id, reported_user_id, book_id, reason, description]
    );

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our moderators will review it shortly.',
      report: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// Retrieve all reports (Admin only)
exports.getAllReports = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
              u1.name as reporter_name, u1.email as reporter_email,
              u2.name as reported_user_name, u2.email as reported_user_email,
              b.title as book_title, b.images as book_images
       FROM reports r
       JOIN users u1 ON r.reporter_id = u1.id
       LEFT JOIN users u2 ON r.reported_user_id = u2.id
       LEFT JOIN books b ON r.book_id = b.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Update report status (Admin only)
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'resolved', 'ignored'

    if (!['resolved', 'ignored', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const result = await db.query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      success: true,
      message: `Report status updated to ${status}`,
      report: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
