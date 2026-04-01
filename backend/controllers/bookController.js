const db = require('../config/db');
const { deleteFromCloudinary } = require('../middleware/upload');

exports.createBook = async (req, res, next) => {
  try {
    const { title, subject, class: className, condition, price, location } = req.body;
    const seller_id = req.user.id;
    
    // Extract image URLs from req.files if uploaded via Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    } else if (req.body.images) {
      // Fallback for manual URLs if provided
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const newBook = await db.query(
      'INSERT INTO books (title, subject, class, condition, price, images, seller_id, location, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, subject, className, condition, price, imageUrls, seller_id, location, 'pending']
    );

    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getBooks = async (req, res, next) => {
  try {
    const { className, subject, minPrice, maxPrice, location, sortBy } = req.query;
    
    let queryText = 'SELECT b.*, u.name as seller_name FROM books b JOIN users u ON b.seller_id = u.id WHERE b.status = $1';
    let params = ['approved'];
    let count = 2;

    if (className) {
      queryText += ` AND b.class = $${count++}`;
      params.push(className);
    }
    if (subject) {
      queryText += ` AND b.subject = $${count++}`;
      params.push(subject);
    }
    if (minPrice) {
      queryText += ` AND b.price >= $${count++}`;
      params.push(minPrice);
    }
    if (maxPrice) {
      queryText += ` AND b.price <= $${count++}`;
      params.push(maxPrice);
    }
    if (location) {
      queryText += ` AND b.location ILIKE $${count++}`;
      params.push(`%${location}%`);
    }

    if (sortBy === 'price_asc') {
      queryText += ' ORDER BY b.price ASC';
    } else if (sortBy === 'price_desc') {
      queryText += ' ORDER BY b.price DESC';
    } else {
      queryText += ' ORDER BY b.created_at DESC';
    }

    const books = await db.query(queryText, params);
    
    // Add request counts
    for (let book of books.rows) {
      const reqCount = await db.query('SELECT COUNT(*) FROM requests WHERE book_id = $1', [book.id]);
      book.request_count = parseInt(reqCount.rows[0].count);
    }

    res.json(books.rows);
  } catch (err) {
    next(err);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const book = await db.query('SELECT b.*, u.name as seller_name FROM books b JOIN users u ON b.seller_id = u.id WHERE b.id = $1', [req.params.id]);
    if (book.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateBookStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'sold'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedBook = await db.query(
      'UPDATE books SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (updatedBook.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(updatedBook.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getMyBooks = async (req, res, next) => {
  try {
    const books = await db.query('SELECT * FROM books WHERE seller_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(books.rows);
  } catch (err) {
    next(err);
  }
};

exports.getPendingBooks = async (req, res, next) => {
  try {
    const books = await db.query('SELECT b.*, u.name as seller_name FROM books b JOIN users u ON b.seller_id = u.id WHERE b.status = $1 ORDER BY b.created_at ASC', ['pending']);
    res.json(books.rows);
  } catch (err) {
    next(err);
  }
};

exports.deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    // Fetch book to get image URLs
    const book = await db.query('SELECT * FROM books WHERE id = $1 AND seller_id = $2', [id, seller_id]);
    
    if (book.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found or unauthorized' });
    }

    // Delete images from Cloudinary
    const imageUrls = book.rows[0].images || [];
    for (const url of imageUrls) {
      await deleteFromCloudinary(url);
    }

    // Delete from database
    await db.query('DELETE FROM books WHERE id = $1', [id]);

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
};
