// backend/controllers/profileController.js
const db = require('../config/db');

/**
 * Core service logic for Seller Trust Score.
 * Computes ratings average, successful transactions, account age, and assigns badges.
 */
const calculateTrustScore = async (sellerId) => {
  try {
    // 1. Ratings average (DELETED - defaulted to 0.0)
    const avgRating = 0.0;
    const ratingsCount = 0;

    // 2. Successful transactions
    const txRes = await db.query(
      "SELECT COUNT(*) FROM transactions WHERE (seller_id = $1 OR buyer_id = $1) AND status = 'completed'",
      [sellerId]
    );
    const successTxCount = parseInt(txRes.rows[0].count) || 0;

    // 3. Account age (days)
    const ageRes = await db.query(
      "SELECT DATE_PART('day', NOW() - created_at) as age, phone_verified, email_verified FROM users WHERE id = $1",
      [sellerId]
    );
    if (ageRes.rows.length === 0) return null;
    const accountAgeDays = parseInt(ageRes.rows[0].age) || 1;
    const isPhoneVerified = ageRes.rows[0].phone_verified || false;
    const isEmailVerified = ageRes.rows[0].email_verified || false;

    // 4. Response Rate Proxy (percentage of incoming read messages)
    const msgRes = await db.query(
      "SELECT COUNT(*) as total, COUNT(CASE WHEN is_read THEN 1 END) as read_count FROM messages WHERE receiver_id = $1",
      [sellerId]
    );
    const totalMsgs = parseInt(msgRes.rows[0].total) || 0;
    const readMsgs = parseInt(msgRes.rows[0].read_count) || 0;
    const responseRate = totalMsgs > 0 ? Math.round((readMsgs / totalMsgs) * 100) : 95; // default 95%

    // Calculate score (0 - 100)
    // - Rating: 40% (5 stars = 100 pts)
    // - Successful Transactions: 30% (capped at 20 txs)
    // - Account Age: 15% (capped at 60 days)
    // - Response Rate: 15%
    const ratingPts = (avgRating / 5) * 40;
    const txPts = Math.min((successTxCount / 20) * 30, 30);
    const agePts = Math.min((accountAgeDays / 60) * 15, 15);
    const respPts = (responseRate / 100) * 15;

    const totalScore = Math.round(ratingPts + txPts + agePts + respPts);

    // Determine Badge System
    let badge = 'New Seller';
    if (totalScore >= 85 && successTxCount >= 15) {
      badge = 'Elite Seller';
    } else if (totalScore >= 70 && successTxCount >= 5) {
      badge = 'Trusted Seller';
    } else if (successTxCount >= 1 || isPhoneVerified || isEmailVerified) {
      badge = 'Verified Seller';
    }

    return {
      averageRating: parseFloat(avgRating.toFixed(1)),
      ratingsCount,
      successfulTransactions: successTxCount,
      accountAgeDays,
      responseRate,
      score: totalScore,
      badge
    };
  } catch (err) {
    console.error('Error calculating trust score:', err);
    return {
      averageRating: 0.0,
      ratingsCount: 0,
      successfulTransactions: 0,
      accountAgeDays: 0,
      responseRate: 100,
      score: 50,
      badge: 'New Seller'
    };
  }
};

exports.getSellerTrustScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const score = await calculateTrustScore(id);
    res.json(score);
  } catch (err) {
    next(err);
  }
};

// Retrieve profile detail including reputation, stars, and user listing stats
exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Fetch base user
    const userRes = await db.query(
      'SELECT id, name, email, role, phone, location, profile_pic, college, branch, semester, bio, created_at, status FROM users WHERE id = $1',
      [id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    const user = userRes.rows[0];

    // Compute trust reputation score
    const trustScore = await calculateTrustScore(id);

    // Books listing aggregates
    const listedCountRes = await db.query('SELECT COUNT(*) FROM books WHERE seller_id = $1', [id]);
    const soldCountRes = await db.query("SELECT COUNT(*) FROM books WHERE seller_id = $1 AND status = 'sold'", [id]);
    
    // Swaps complete aggregate
    const swappedCountRes = await db.query(
      "SELECT COUNT(*) FROM transactions WHERE (seller_id = $1 OR buyer_id = $1) AND type = 'SWAP' AND status = 'completed'",
      [id]
    );

    // Fetch user ratings list (DELETED - returned empty list)
    const reviewsRes = { rows: [] };

    res.json({
      user,
      reputation: trustScore,
      stats: {
        listedBooks: parseInt(listedCountRes.rows[0].count),
        soldBooks: parseInt(soldCountRes.rows[0].count),
        swappedBooks: parseInt(swappedCountRes.rows[0].count)
      },
      reviews: reviewsRes.rows
    });
  } catch (err) {
    next(err);
  }
};

// Update profile details
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, location, college, branch, semester, bio } = req.body;
    
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           location = COALESCE($2, location), 
           college = COALESCE($3, college), 
           branch = COALESCE($4, branch), 
           semester = COALESCE($5, semester), 
           bio = COALESCE($6, bio)
       WHERE id = $7
       RETURNING id, name, email, role, location, profile_pic, college, branch, semester, bio, created_at`,
      [name, location, college, branch, semester, bio, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
