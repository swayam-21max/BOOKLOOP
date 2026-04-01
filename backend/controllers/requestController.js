const db = require('../config/db');

exports.createRequest = async (req, res, next) => {
  try {
    const { book_id } = req.body;
    const buyer_id = req.user.id;

    // Check if book exists and is approved
    const book = await db.query('SELECT * FROM books WHERE id = $1 AND status = $2', [book_id, 'approved']);
    if (book.rows.length === 0) {
      return res.status(404).json({ message: 'Approved book not found' });
    }

    // Check if buyer already requested this book
    const existingReq = await db.query('SELECT * FROM requests WHERE book_id = $1 AND buyer_id = $2', [book_id, buyer_id]);
    if (existingReq.rows.length > 0) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const newRequest = await db.query(
      'INSERT INTO requests (book_id, buyer_id, status) VALUES ($1, $2, $3) RETURNING *',
      [book_id, buyer_id, 'pending']
    );

    res.status(201).json(newRequest.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.acceptRequest = async (req, res, next) => {
  const { id } = req.params; // Request ID

  try {
    // 1. Get the request and the associated book
    const requestResult = await db.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    const request = requestResult.rows[0];
    const book_id = request.book_id;

    // 2. Check if the user is the seller of the book
    const bookResult = await db.query('SELECT * FROM books WHERE id = $1', [book_id]);
    if (bookResult.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // 3. Start Transaction
    await db.query('BEGIN');

    // Accept this request
    await db.query('UPDATE requests SET status = $1 WHERE id = $2', ['accepted', id]);

    // Reject all other requests for this book
    await db.query('UPDATE requests SET status = $1 WHERE book_id = $2 AND id != $3', ['rejected', book_id, id]);

    // Mark book as sold
    await db.query('UPDATE books SET status = $1 WHERE id = $2', ['sold', book_id]);

    await db.query('COMMIT');

    res.json({ message: 'Request accepted and book marked as sold' });
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

exports.getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await db.query(
      `SELECT r.*, b.title as book_title, u.name as buyer_name 
       FROM requests r 
       JOIN books b ON r.book_id = b.id 
       JOIN users u ON r.buyer_id = u.id 
       WHERE b.seller_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(requests.rows);
  } catch (err) {
    next(err);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await db.query(
      `SELECT r.*, b.title as book_title, b.price as book_price, u.name as seller_name 
       FROM requests r 
       JOIN books b ON r.book_id = b.id 
       JOIN users u ON b.seller_id = u.id 
       WHERE r.buyer_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(requests.rows);
  } catch (err) {
    next(err);
  }
};
