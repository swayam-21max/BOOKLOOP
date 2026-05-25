// backend/services/notificationService.js
const db = require('../config/db');
const { sendNotificationToUser } = require('../socket');
const { sendWishlistAlertEmail } = require('./emailService');

/**
 * Creates a notification in the database and pushes it via Socket.io in real-time.
 * @param {string} userId - ID of the target user
 * @param {string} title - Title of the notification
 * @param {string} message - Notification details
 * @param {string} type - Notification Type (e.g. 'New Message', 'Wishlist Match', etc.)
 * @returns {object} The created notification database row
 */
exports.createNotification = async (userId, title, message, type) => {
  try {
    const result = await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, message, type]
    );
    const notification = result.rows[0];

    // Push real-time alert via Socket.io
    sendNotificationToUser(userId, 'new_notification', notification);
    
    return notification;
  } catch (err) {
    console.error('Error creating notification in service:', err);
    throw err;
  }
};

/**
 * Scans wishlists and triggers matches for a newly approved book.
 * Handles granular (keyword, subject, author, price) matches.
 * @param {object} book - The book database row that was created/approved
 */
exports.triggerWishlistMatches = async (book) => {
  try {
    // Advanced matching logic: match query, keyword, subject, author, or price thresholds
    const matchQuery = `
      SELECT w.*, u.email, u.name 
      FROM wishlists w
      JOIN users u ON w.user_id = u.id
      WHERE w.user_id != $1 AND (
        -- Legacy query check
        (w.query IS NOT NULL AND (
          $2 ILIKE '%' || w.query || '%' OR 
          $3 ILIKE '%' || w.query || '%'
        ))
        OR
        -- Granular filters check
        (
          (w.keyword IS NOT NULL AND $2 ILIKE '%' || w.keyword || '%') OR
          (w.subject IS NOT NULL AND $3 ILIKE '%' || w.subject || '%') OR
          (w.author IS NOT NULL AND $4 ILIKE '%' || w.author || '%') OR
          (w.max_price IS NOT NULL AND $5 <= w.max_price)
        )
      )
    `;

    // Wait, the books table doesn't have an "author" column, but we will support matching on title/subject/price
    // Pass empty author or book.author (or book.title as fallback for author if we don't have author field yet)
    const matches = await db.query(matchQuery, [
      book.seller_id,
      book.title,
      book.subject,
      book.title, // author fallback
      book.price
    ]);

    for (const match of matches.rows) {
      const title = 'Wishlist Match Alert!';
      const message = `A new book "${book.title}" matching your wishlist has been listed for $${book.price}. Check it out in the marketplace!`;
      
      // 1. Create DB notification and emit Socket.io alert
      await exports.createNotification(match.user_id, title, message, 'Wishlist Match');
      
      // 2. Send email notification
      try {
        await sendWishlistAlertEmail(match.email, match.name, book.title);
      } catch (emailErr) {
        console.error(`Failed to send email to ${match.email}:`, emailErr.message);
      }
    }
  } catch (err) {
    console.error('Error triggering wishlist alerts:', err);
  }
};
