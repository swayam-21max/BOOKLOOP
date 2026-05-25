// backend/controllers/transactionController.js
const db = require('../config/db');

// Get all transaction logs for current logged-in user
exports.getMyTransactions = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT t.*, b.title as book_title, b.price as book_price, b.images as book_images,
              u1.name as buyer_name, u2.name as seller_name
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       JOIN users u1 ON t.buyer_id = u1.id
       JOIN users u2 ON t.seller_id = u2.id
       WHERE t.buyer_id = $1 OR t.seller_id = $1
       ORDER BY t.completed_at DESC NULLS FIRST, t.id DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Gamification Leaderboard: Top Sellers, Swappers, Rated Users, and Active Users
exports.getLeaderboard = async (req, res, next) => {
  try {
    // Helper to assign medals/badges based on ranking
    const assignGamificationBadge = (index) => {
      if (index === 0) return 'Platinum';
      if (index <= 2) return 'Gold';
      if (index <= 4) return 'Silver';
      return 'Bronze';
    };

    // 1. Top Sellers (completed BUYs)
    const topSellersRes = await db.query(`
      SELECT u.id, u.name, u.profile_pic, COUNT(t.id) as completed_buys
      FROM users u
      JOIN transactions t ON t.seller_id = u.id
      WHERE t.status = 'completed' AND t.type = 'BUY'
      GROUP BY u.id, u.name, u.profile_pic
      ORDER BY completed_buys DESC
      LIMIT 10
    `);
    const topSellers = topSellersRes.rows.map((row, idx) => ({
      ...row,
      rankBadge: assignGamificationBadge(idx)
    }));

    // 2. Top Swappers (completed SWAPs)
    const topSwappersRes = await db.query(`
      SELECT u.id, u.name, u.profile_pic, COUNT(t.id) as completed_swaps
      FROM users u
      JOIN transactions t ON (t.seller_id = u.id OR t.buyer_id = u.id)
      WHERE t.status = 'completed' AND t.type = 'SWAP'
      GROUP BY u.id, u.name, u.profile_pic
      ORDER BY completed_swaps DESC
      LIMIT 10
    `);
    const topSwappers = topSwappersRes.rows.map((row, idx) => ({
      ...row,
      rankBadge: assignGamificationBadge(idx)
    }));

    // 3. Highest Rated Users (DELETED - defaulted to empty)
    const highestRated = [];

    // 4. Most Active Users (by listing volume)
    const mostActiveRes = await db.query(`
      SELECT u.id, u.name, u.profile_pic, COUNT(b.id) as listings_count
      FROM users u
      JOIN books b ON b.seller_id = u.id
      GROUP BY u.id, u.name, u.profile_pic
      ORDER BY listings_count DESC
      LIMIT 10
    `);
    const mostActive = mostActiveRes.rows.map((row, idx) => ({
      ...row,
      rankBadge: assignGamificationBadge(idx)
    }));

    res.json({
      topSellers,
      topSwappers,
      highestRated,
      mostActive
    });
  } catch (err) {
    next(err);
  }
};
