const db = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const booksCount = await db.query('SELECT COUNT(*) FROM books');
    const pendingBooksCount = await db.query('SELECT COUNT(*) FROM books WHERE status = $1', ['pending']);
    const completedTradesCount = await db.query('SELECT COUNT(*) FROM requests WHERE status = $1', ['accepted']);

    // Analytics data (books per subject)
    const booksPerSubject = await db.query('SELECT subject, COUNT(*) as count FROM books GROUP BY subject');
    
    // Analytics data (requests trend - simple count)
    const totalRequests = await db.query('SELECT COUNT(*) FROM requests');

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalBooks: parseInt(booksCount.rows[0].count),
      pendingApprovals: parseInt(pendingBooksCount.rows[0].count),
      completedTrades: parseInt(completedTradesCount.rows[0].count),
      analytics: {
        booksPerSubject: booksPerSubject.rows.map(r => ({ name: r.subject, count: parseInt(r.count) })),
        totalRequests: parseInt(totalRequests.rows[0].count)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await db.query('SELECT id, name, email, role, location, created_at FROM users ORDER BY created_at DESC');
    res.json(users.rows);
  } catch (err) {
    next(err);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await db.query(`
      SELECT r.*, u1.name as reviewer_name, u2.name as reviewee_name 
      FROM ratings r 
      JOIN users u1 ON r.reviewer_id = u1.id 
      JOIN users u2 ON r.reviewee_id = u2.id 
      ORDER BY r.created_at DESC
    `);
    res.json(reviews.rows);
  } catch (err) {
    next(err);
  }
};
