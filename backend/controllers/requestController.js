const db = require('../config/db');

exports.createRequest = async (req, res, next) => {
  try {
    const { book_id, request_type = 'buy', offered_book_id = null } = req.body;
    const buyer_id = req.user.id;

    if (request_type === 'swap') {
      if (!offered_book_id) return res.status(400).json({ message: 'Offered book is required for swap' });
      const offered = await db.query('SELECT * FROM books WHERE id = $1 AND seller_id = $2 AND status = $3', [offered_book_id, buyer_id, 'approved']);
      if (offered.rows.length === 0) return res.status(400).json({ message: 'Invalid offered book' });
    }

    // Check if book exists and is approved
    const book = await db.query('SELECT * FROM books WHERE id = $1 AND status = $2', [book_id, 'approved']);
    if (book.rows.length === 0) {
      return res.status(404).json({ message: 'Approved book not found' });
    }
    const seller_id = book.rows[0].seller_id;

    if (seller_id === buyer_id) {
      return res.status(400).json({ message: 'You cannot request your own book' });
    }

    // Check if buyer already requested this book
    const existingReq = await db.query('SELECT * FROM requests WHERE book_id = $1 AND buyer_id = $2', [book_id, buyer_id]);
    if (existingReq.rows.length > 0) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    await db.query('BEGIN');

    const newRequest = await db.query(
      'INSERT INTO requests (book_id, buyer_id, status, request_type, offered_book_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [book_id, buyer_id, 'pending', request_type, offered_book_id]
    );

    // Create a pending transaction (Feature 8)
    await db.query(
      'INSERT INTO transactions (buyer_id, seller_id, book_id, type, status) VALUES ($1, $2, $3, $4, $5)',
      [buyer_id, seller_id, book_id, request_type.toUpperCase(), 'pending']
    );

    await db.query('COMMIT');

    // Trigger Notification for the Seller
    const buyerRes = await db.query('SELECT name FROM users WHERE id = $1', [buyer_id]);
    const buyerName = buyerRes.rows[0]?.name || 'A buyer';
    const notifType = request_type === 'swap' ? 'Swap Request' : 'Buy Request';
    const notifTitle = `New ${request_type === 'swap' ? 'Swap' : 'Buy'} Request`;
    const notifMessage = `${buyerName} wants to ${request_type === 'swap' ? 'swap' : 'buy'} your book "${book.rows[0].title}".`;
    
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification(seller_id, notifTitle, notifMessage, notifType);

    res.status(201).json(newRequest.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
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
    const buyer_id = request.buyer_id;

    // 2. Check if the user is the seller of the book
    const bookResult = await db.query('SELECT * FROM books WHERE id = $1', [book_id]);
    const book = bookResult.rows[0];
    if (book.seller_id !== req.user.id) {
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

    // Update Transaction to completed (Feature 8)
    await db.query(
      "UPDATE transactions SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE buyer_id = $1 AND book_id = $2",
      [buyer_id, book_id]
    );

    // Reject transactions for all other buyers for this book
    await db.query(
      "UPDATE transactions SET status = 'rejected', completed_at = CURRENT_TIMESTAMP WHERE book_id = $1 AND buyer_id != $2",
      [book_id, buyer_id]
    );

    await db.query('COMMIT');

    // Create Notification for the Accepted Buyer
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification(
      buyer_id,
      'Request Accepted!',
      `Great news! The seller accepted your request for "${book.title}". You can coordinate pick-up via messaging.`,
      'Request Accepted'
    );

    // Create Notifications for the Rejected Buyers
    const otherReqs = await db.query('SELECT buyer_id FROM requests WHERE book_id = $1 AND id != $2', [book_id, id]);
    for (const other of otherReqs.rows) {
      await notificationService.createNotification(
        other.buyer_id,
        'Request Rejected',
        `Sorry, the listing for "${book.title}" was sold/swapped to another user.`,
        'Request Rejected'
      );
    }

    res.json({ message: 'Request accepted and book marked as sold' });
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

exports.rejectRequest = async (req, res, next) => {
  const { id } = req.params;

  try {
    const requestResult = await db.query('SELECT * FROM requests WHERE id = $1', [id]);
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    const request = requestResult.rows[0];
    const book_id = request.book_id;
    const buyer_id = request.buyer_id;

    const bookResult = await db.query('SELECT * FROM books WHERE id = $1', [book_id]);
    const book = bookResult.rows[0];
    if (book.seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.query('BEGIN');

    // Update request to rejected
    await db.query('UPDATE requests SET status = $1 WHERE id = $2', ['rejected', id]);

    // Update transaction to rejected
    await db.query(
      "UPDATE transactions SET status = 'rejected', completed_at = CURRENT_TIMESTAMP WHERE buyer_id = $1 AND book_id = $2",
      [buyer_id, book_id]
    );

    await db.query('COMMIT');

    // Create Notification for the Rejected Buyer
    const notificationService = require('../services/notificationService');
    await notificationService.createNotification(
      buyer_id,
      'Request Rejected',
      `Your request for "${book.title}" was declined by the seller.`,
      'Request Rejected'
    );

    res.json({ message: 'Request declined' });
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

exports.getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await db.query(
      `SELECT r.*, b.title as book_title, u.name as buyer_name, ob.title as offered_book_title 
       FROM requests r 
       JOIN books b ON r.book_id = b.id 
       JOIN users u ON r.buyer_id = u.id 
       LEFT JOIN books ob ON r.offered_book_id = ob.id
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
      `SELECT r.*, b.title as book_title, b.price as book_price, u.name as seller_name, ob.title as offered_book_title 
       FROM requests r 
       JOIN books b ON r.book_id = b.id 
       JOIN users u ON b.seller_id = u.id 
       LEFT JOIN books ob ON r.offered_book_id = ob.id
       WHERE r.buyer_id = $1 ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(requests.rows);
  } catch (err) {
    next(err);
  }
};
