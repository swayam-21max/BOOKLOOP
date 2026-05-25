const db = require('../config/db');

exports.addWishlist = async (req, res, next) => {
  try {
    const { query, book_id, keyword, subject, author, max_price } = req.body;
    if (!query && !book_id && !keyword && !subject && !author && !max_price) {
      return res.status(400).json({ message: 'At least one alert criterion or book_id is required' });
    }

    // If it's a book_id, check if already wishlisted
    if (book_id) {
      const existing = await db.query('SELECT * FROM wishlists WHERE user_id = $1 AND book_id = $2', [req.user.id, book_id]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: 'Book already in wishlist' });
      }
    }

    const newWishlist = await db.query(
      `INSERT INTO wishlists (user_id, query, book_id, keyword, subject, author, max_price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        req.user.id, 
        query || null, 
        book_id || null, 
        keyword || null, 
        subject || null, 
        author || null, 
        max_price ? parseFloat(max_price) : null
      ]
    );

    res.status(201).json(newWishlist.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getWishlists = async (req, res, next) => {
  try {
    const wishlists = await db.query(
      `SELECT w.*, b.title as book_title, b.price as book_price, b.images as book_images 
       FROM wishlists w 
       LEFT JOIN books b ON w.book_id = b.id 
       WHERE w.user_id = $1 
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json(wishlists.rows);
  } catch (err) {
    next(err);
  }
};

exports.deleteWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Ensure the wishlist belongs to the user
    const wishlist = await db.query('SELECT * FROM wishlists WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (wishlist.rows.length === 0) {
      return res.status(404).json({ message: 'Wishlist not found or unauthorized' });
    }

    await db.query('DELETE FROM wishlists WHERE id = $1', [id]);
    res.json({ message: 'Wishlist deleted' });
  } catch (err) {
    next(err);
  }
};
