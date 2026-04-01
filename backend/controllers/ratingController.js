// backend/controllers/ratingController.js
const db = require('../config/db');

exports.submitRating = async (req, res, next) => {
  try {
    const { request_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify trade completion and participant presence
    const request = await db.query(
      'SELECT r.*, b.seller_id FROM requests r JOIN books b ON r.book_id = b.id WHERE r.id = $1 AND r.status = $2',
      [request_id, 'accepted']
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ message: 'Completed trade not found' });
    }

    const trade = request.rows[0];
    const isBuyer = trade.buyer_id === reviewer_id;
    const isSeller = trade.seller_id === reviewer_id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'You were not a participant in this trade' });
    }

    const reviewee_id = isBuyer ? trade.seller_id : trade.buyer_id;

    const newRating = await db.query(
      'INSERT INTO ratings (request_id, reviewer_id, reviewee_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [request_id, reviewer_id, reviewee_id, rating, comment]
    );

    res.status(201).json(newRating.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
       return res.status(400).json({ message: 'You have already rated this trade' });
    }
    next(err);
  }
};

exports.getUserRatings = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const ratings = await db.query(
      'SELECT r.*, u.name as reviewer_name FROM ratings r JOIN users u ON r.reviewer_id = u.id WHERE r.reviewee_id = $1 ORDER BY r.created_at DESC',
      [user_id]
    );

    const stats = await db.query(
      'SELECT AVG(rating)::NUMERIC(10,1) as average_rating, COUNT(*) as total_count FROM ratings WHERE reviewee_id = $1',
      [user_id]
    );

    res.json({
      reviews: ratings.rows,
      stats: {
        averageRating: stats.rows[0].average_rating || 0,
        totalCount: stats.rows[0].total_count || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM ratings WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    next(err);
  }
};
