// backend/services/analyticsService.js
const db = require('../config/db');

/**
 * Gathers comprehensive statistics and chart metrics for the BOOKLOOP Marketplace.
 * Used to feed Recharts visual charts in the Admin Moderation console.
 */
exports.getMarketplaceAnalytics = async () => {
  try {
    // 1. Core aggregates
    const totalUsersRes = await db.query('SELECT COUNT(*) FROM users');
    const activeUsersRes = await db.query("SELECT COUNT(*) FROM users WHERE status = 'active'");
    const totalBooksRes = await db.query('SELECT COUNT(*) FROM books');
    const pendingBooksRes = await db.query("SELECT COUNT(*) FROM books WHERE status = 'pending'");
    
    // Transactions counts
    const booksSoldRes = await db.query("SELECT COUNT(*) FROM transactions WHERE type = 'BUY' AND status = 'completed'");
    const booksSwappedRes = await db.query("SELECT COUNT(*) FROM transactions WHERE type = 'SWAP' AND status = 'completed'");
    
    // Revenue Estimate (e.g., total volume transacted or simple 5% platform service estimation)
    const totalVolumeRes = await db.query(`
      SELECT COALESCE(SUM(b.price), 0) as total 
      FROM transactions t 
      JOIN books b ON t.book_id = b.id 
      WHERE t.status = 'completed'
    `);
    const totalVolume = parseFloat(totalVolumeRes.rows[0].total);
    const revenueEstimate = totalVolume * 0.05; // 5% platform commission model

    // 2. Top Book Categories (by volume listed)
    const topCategoriesRes = await db.query(`
      SELECT subject as category, COUNT(*) as count 
      FROM books 
      GROUP BY subject 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // 3. Most Active Sellers
    const activeSellersRes = await db.query(`
      SELECT u.id, u.name, COUNT(*) as listings_count,
             (SELECT COUNT(*) FROM books b2 WHERE b2.seller_id = u.id AND b2.status = 'sold') as sold_count
      FROM users u
      JOIN books b ON b.seller_id = u.id
      WHERE u.role = 'seller'
      GROUP BY u.id, u.name
      ORDER BY listings_count DESC
      LIMIT 5
    `);

    // 4. Most Popular Subjects (by view counts)
    const popularSubjectsRes = await db.query(`
      SELECT b.subject, COUNT(bv.id) as views_count
      FROM book_views bv
      JOIN books b ON bv.book_id = b.id
      GROUP BY b.subject
      ORDER BY views_count DESC
      LIMIT 5
    `);

    // 5. Monthly User Signups Trend (last 6 months)
    const userTrendRes = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as signups
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    `);

    // 6. Monthly Transaction Volume (last 6 months)
    const transactionTrendRes = await db.query(`
      SELECT TO_CHAR(completed_at, 'YYYY-MM') as month,
             COUNT(CASE WHEN type = 'BUY' THEN 1 END) as buys,
             COUNT(CASE WHEN type = 'SWAP' THEN 1 END) as swaps
      FROM transactions
      WHERE completed_at >= NOW() - INTERVAL '6 months' AND status = 'completed'
      GROUP BY month
      ORDER BY month ASC
    `);

    return {
      overview: {
        totalUsers: parseInt(totalUsersRes.rows[0].count),
        activeUsers: parseInt(activeUsersRes.rows[0].count),
        totalBooks: parseInt(totalBooksRes.rows[0].count),
        pendingBooks: parseInt(pendingBooksRes.rows[0].count),
        booksSold: parseInt(booksSoldRes.rows[0].count),
        booksSwapped: parseInt(booksSwappedRes.rows[0].count),
        totalVolume,
        revenueEstimate,
      },
      charts: {
        topCategories: topCategoriesRes.rows.map(r => ({ name: r.category, value: parseInt(r.count) })),
        mostActiveSellers: activeSellersRes.rows.map(r => ({ name: r.name, listings: parseInt(r.listings_count), sold: parseInt(r.sold_count) })),
        popularSubjects: popularSubjectsRes.rows.map(r => ({ name: r.subject, views: parseInt(r.views_count) })),
        userTrend: userTrendRes.rows.map(r => ({ name: r.month, Users: parseInt(r.signups) })),
        transactionTrend: transactionTrendRes.rows.map(r => ({ name: r.month, Buys: parseInt(r.buys), Swaps: parseInt(r.swaps) })),
      }
    };
  } catch (err) {
    console.error('Error compiling analytics:', err);
    throw err;
  }
};
