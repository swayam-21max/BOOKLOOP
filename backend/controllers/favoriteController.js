// backend/controllers/favoriteController.js
const db = require('../config/db');

// Add a book to favorites
exports.addToFavorites = async (req, res, next) => {
  try {
    const { book_id } = req.body;
    if (!book_id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    // Check if book exists
    const bookCheck = await db.query('SELECT * FROM books WHERE id = $1', [book_id]);
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Insert into favorites
    const result = await db.query(
      'INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT (user_id, book_id) DO NOTHING RETURNING *',
      [req.user.id, book_id]
    );

    res.status(201).json({
      success: true,
      message: 'Book added to favorites',
      data: result.rows[0] || { user_id: req.user.id, book_id }
    });
  } catch (err) {
    next(err);
  }
};

// Remove a book from favorites
exports.removeFromFavorites = async (req, res, next) => {
  try {
    const { id } = req.params; // book_id or favorites entry id
    
    // We try deleting by book_id first since it's the standard toggle key on the card
    const result = await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND (book_id = $2 OR id = $2) RETURNING *',
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
};

// Retrieve favorited books
exports.getFavorites = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT f.id as favorite_id, f.created_at as favorited_at, b.*, u.name as seller_name
       FROM favorites f
       JOIN books b ON f.book_id = b.id
       JOIN users u ON b.seller_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
