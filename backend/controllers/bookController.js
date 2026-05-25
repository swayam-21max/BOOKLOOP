const db = require('../config/db');
const { deleteFromCloudinary } = require('../middleware/upload');
const { sendWishlistAlertEmail } = require('../services/emailService');

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

    const insertedBook = newBook.rows[0];

    // Trigger Wishlist Match Alerts
    try {
      const matchQuery = `
        SELECT w.*, u.email, u.name 
        FROM wishlists w
        JOIN users u ON w.user_id = u.id
        WHERE $1 ILIKE '%' || w.query || '%' OR $2 ILIKE '%' || w.query || '%'
      `;
      const matches = await db.query(matchQuery, [title, subject]);
      
      // Send email to all matched users
      for (const match of matches.rows) {
        if (match.user_id !== seller_id) {
          await sendWishlistAlertEmail(match.email, match.name, insertedBook.title);
        }
      }
    } catch (matchErr) {
      console.error('Error processing wishlist matches:', matchErr);
    }

    res.status(201).json(insertedBook);
  } catch (err) {
    next(err);
  }
};

exports.getBooks = async (req, res, next) => {
  try {
    const { 
      className, 
      subject, 
      minPrice, 
      maxPrice, 
      location, 
      condition, 
      semester, 
      department, 
      availability,
      sortBy 
    } = req.query;
    
    let queryText = `
      SELECT b.*, u.name as seller_name, u.college, u.branch, u.semester, u.profile_pic as seller_pic,
             (SELECT COUNT(*) FROM book_views bv WHERE bv.book_id = b.id) as views_count
      FROM books b 
      JOIN users u ON b.seller_id = u.id 
      WHERE 1=1
    `;
    let params = [];
    let count = 1;

    // Filter by availability/status
    if (availability) {
      queryText += ` AND b.status = $${count++}`;
      params.push(availability);
    } else {
      queryText += ` AND b.status = $${count++}`;
      params.push('approved'); // default only approved books shown
    }

    if (className) {
      queryText += ` AND b.class = $${count++}`;
      params.push(className);
    }
    if (subject) {
      queryText += ` AND b.subject ILIKE $${count++}`;
      params.push(`%${subject}%`);
    }
    if (minPrice) {
      queryText += ` AND b.price >= $${count++}`;
      params.push(minPrice);
    }
    if (maxPrice) {
      queryText += ` AND b.price <= $${count++}`;
      params.push(maxPrice);
    }
    if (condition) {
      queryText += ` AND b.condition = $${count++}`;
      params.push(condition);
    }
    if (location) {
      queryText += ` AND b.location ILIKE $${count++}`;
      params.push(`%${location}%`);
    }
    if (semester) {
      queryText += ` AND u.semester = $${count++}`;
      params.push(semester);
    }
    if (department) {
      queryText += ` AND u.branch = $${count++}`;
      params.push(department);
    }


    // Sorting
    if (sortBy === 'price_asc') {
      queryText += ' ORDER BY b.price ASC';
    } else if (sortBy === 'price_desc') {
      queryText += ' ORDER BY b.price DESC';
    } else if (sortBy === 'popular' || sortBy === 'views') {
      queryText += ' ORDER BY views_count DESC, b.created_at DESC';
    } else if (sortBy === 'oldest') {
      queryText += ' ORDER BY b.created_at ASC';
    } else {
      queryText += ' ORDER BY b.created_at DESC'; // default newest
    }

    const books = await db.query(queryText, params);
    
    // Add request counts
    for (let book of books.rows) {
      const reqCount = await db.query('SELECT COUNT(*) FROM requests WHERE book_id = $1', [book.id]);
      book.request_count = parseInt(reqCount.rows[0].count);
      book.views_count = parseInt(book.views_count);
      book.seller_rating = 0.0;
    }

    res.json(books.rows);
  } catch (err) {
    next(err);
  }
};

exports.getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookRes = await db.query(
      `SELECT b.*, u.name as seller_name, u.profile_pic as seller_pic, u.college, u.branch, u.semester
       FROM books b 
       JOIN users u ON b.seller_id = u.id 
       WHERE b.id = $1`, 
      [id]
    );
    
    if (bookRes.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const book = bookRes.rows[0];

    // Record viewed event inside book_views and recent_views if authenticated
    // Note: auth middleware might not block this route, let's parse JWT manually if token exists in headers
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch (e) {
        // invalid token, treat as anonymous
      }
    }

    // Save total views (Feature 11)
    await db.query('INSERT INTO book_views (user_id, book_id) VALUES ($1, $2)', [userId, id]);

    // Save personalized recent views (Feature 4)
    if (userId) {
      await db.query(
        `INSERT INTO recent_views (user_id, book_id) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id, book_id) 
         DO UPDATE SET viewed_at = CURRENT_TIMESTAMP`,
        [userId, id]
      );
      // Prune old views keeping only the latest 20
      await db.query(
        `DELETE FROM recent_views 
         WHERE user_id = $1 
           AND id NOT IN (
             SELECT id FROM recent_views 
             WHERE user_id = $1 
             ORDER BY viewed_at DESC 
             LIMIT 20
           )`,
        [userId]
      );
    }

    // Fetch aggregate views count
    const viewsCountRes = await db.query('SELECT COUNT(*) FROM book_views WHERE book_id = $1', [id]);
    book.views_count = parseInt(viewsCountRes.rows[0].count);

    // Fetch seller average rating (DELETED - defaulted to 0.0)
    book.seller_rating = 0.0;

    res.json(book);
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

exports.getRecentViews = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT rv.viewed_at, b.*, u.name as seller_name 
       FROM recent_views rv
       JOIN books b ON rv.book_id = b.id
       JOIN users u ON b.seller_id = u.id
       WHERE rv.user_id = $1
       ORDER BY rv.viewed_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const recommendationService = require('../services/recommendationService');
    const recommendedForYou = await recommendationService.getRecommendedForYou(req.user.id, 6);
    const studentsAlsoViewed = await recommendationService.getStudentsAlsoViewed(req.user.id, 6);
    const popularInDept = await recommendationService.getPopularInDepartment(req.user.id, 6);
    
    res.json({
      recommendedForYou,
      studentsAlsoViewed,
      popularInDept
    });
  } catch (err) {
    next(err);
  }
};
