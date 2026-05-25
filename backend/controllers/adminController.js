// backend/controllers/adminController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const analyticsService = require('../services/analyticsService');

// Retrieve advanced recharts analytics & overview numbers (Feature 9)
exports.getStats = async (req, res, next) => {
  try {
    const analyticsData = await analyticsService.getMarketplaceAnalytics();
    res.json(analyticsData);
  } catch (err) {
    next(err);
  }
};

// Retrieve all users list (Feature 13)
exports.getUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, phone, location, status, college, branch, semester, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Ban a user
exports.banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE users SET status = 'banned' WHERE id = $1 RETURNING id, name, email, status",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, message: 'User has been banned successfully', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Suspend a user
exports.suspendUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE users SET status = 'suspended' WHERE id = $1 RETURNING id, name, email, status",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, message: 'User has been suspended successfully', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Activate user (Unban / Unsuspend)
exports.activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "UPDATE users SET status = 'active' WHERE id = $1 RETURNING id, name, email, status",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ success: true, message: 'User has been activated successfully', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// Reset user password (Feature 13)
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await db.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, name, email',
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, message: 'User password reset successful', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// View Detailed user activity (listings, completed transactions)
exports.getUserActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listingsRes = await db.query('SELECT COUNT(*) FROM books WHERE seller_id = $1', [id]);
    const salesRes = await db.query("SELECT COUNT(*) FROM transactions WHERE seller_id = $1 AND status = 'completed'", [id]);
    const buysRes = await db.query("SELECT COUNT(*) FROM transactions WHERE buyer_id = $1 AND status = 'completed'", [id]);
    const viewsRes = await db.query('SELECT COUNT(*) FROM book_views WHERE user_id = $1', [id]);

    res.json({
      listingsCount: parseInt(listingsRes.rows[0].count),
      salesCount: parseInt(salesRes.rows[0].count),
      buysCount: parseInt(buysRes.rows[0].count),
      viewsCount: parseInt(viewsRes.rows[0].count)
    });
  } catch (err) {
    next(err);
  }
};

// View all listings for moderation
exports.getAllListings = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT b.*, u.name as seller_name, u.email as seller_email 
       FROM books b 
       JOIN users u ON b.seller_id = u.id 
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
