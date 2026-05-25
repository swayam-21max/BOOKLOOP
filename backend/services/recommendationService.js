// backend/services/recommendationService.js
const db = require('../config/db');

/**
 * Personalized Recommendations: Ranks approved books based on the user's wishlist subjects
 * and subjects of recently viewed books.
 */
exports.getRecommendedForYou = async (userId, limit = 6) => {
  try {
    const query = `
      WITH user_interests AS (
        -- Subjects from user's wishlist
        SELECT DISTINCT TRIM(LOWER(subject)) AS interest_subject
        FROM wishlists
        WHERE user_id = $1 AND subject IS NOT NULL AND subject != ''
        
        UNION
        
        -- Subjects from user's legacy wishlist queries
        SELECT DISTINCT TRIM(LOWER(query)) AS interest_subject
        FROM wishlists
        WHERE user_id = $1 AND query IS NOT NULL AND query != ''
        
        UNION
        
        -- Subjects from user's recently viewed books
        SELECT DISTINCT TRIM(LOWER(b.subject)) AS interest_subject
        FROM recent_views rv
        JOIN books b ON rv.book_id = b.id
        WHERE rv.user_id = $1
      )
      SELECT b.*, u.name as seller_name,
             (SELECT COUNT(*) FROM book_views bv WHERE bv.book_id = b.id) as view_count
      FROM books b
      JOIN users u ON b.seller_id = u.id
      WHERE b.status = 'approved' 
        AND b.seller_id != $1
        -- Exclude books already viewed
        AND b.id NOT IN (SELECT book_id FROM recent_views WHERE user_id = $1)
        -- Exclude books already favorited
        AND b.id NOT IN (SELECT book_id FROM favorites WHERE user_id = $1)
        -- Match user interests
        AND (
          TRIM(LOWER(b.subject)) IN (SELECT interest_subject FROM user_interests)
          OR (SELECT COUNT(*) FROM user_interests) = 0 -- Fallback: if no interests, show any approved
        )
      ORDER BY view_count DESC, b.created_at DESC
      LIMIT $2;
    `;
    const result = await db.query(query, [userId, limit]);
    return result.rows;
  } catch (err) {
    console.error('Error in getRecommendedForYou:', err);
    return [];
  }
};

/**
 * Collaborative Filtering: "Students Also Viewed"
 * Find other users who viewed the same books as this user, see what else they viewed,
 * and recommend those books.
 */
exports.getStudentsAlsoViewed = async (userId, limit = 6) => {
  try {
    const query = `
      WITH similar_users AS (
        -- Find users who viewed the same books
        SELECT DISTINCT rv2.user_id
        FROM recent_views rv1
        JOIN recent_views rv2 ON rv1.book_id = rv2.book_id
        WHERE rv1.user_id = $1 AND rv2.user_id != $1
      ),
      recommended_books AS (
        -- Find what else those similar users viewed
        SELECT rv.book_id, COUNT(*) as peer_view_count
        FROM recent_views rv
        WHERE rv.user_id IN (SELECT user_id FROM similar_users)
          AND rv.book_id NOT IN (SELECT book_id FROM recent_views WHERE user_id = $1)
        GROUP BY rv.book_id
      )
      SELECT b.*, u.name as seller_name, r.peer_view_count
      FROM recommended_books r
      JOIN books b ON r.book_id = b.id
      JOIN users u ON b.seller_id = u.id
      WHERE b.status = 'approved' AND b.seller_id != $1
      ORDER BY r.peer_view_count DESC, b.created_at DESC
      LIMIT $2;
    `;
    const result = await db.query(query, [userId, limit]);
    
    // Fallback: if no collaborative recommendations, return overall most viewed approved books
    if (result.rows.length === 0) {
      const fallbackQuery = `
        SELECT b.*, u.name as seller_name, 
               (SELECT COUNT(*) FROM book_views bv WHERE bv.book_id = b.id) as view_count
        FROM books b
        JOIN users u ON b.seller_id = u.id
        WHERE b.status = 'approved' AND b.seller_id != $1
        ORDER BY view_count DESC, b.created_at DESC
        LIMIT $2;
      `;
      const fallbackResult = await db.query(fallbackQuery, [userId, limit]);
      return fallbackResult.rows;
    }
    
    return result.rows;
  } catch (err) {
    console.error('Error in getStudentsAlsoViewed:', err);
    return [];
  }
};

/**
 * Geographic/Campus Affinity: "Popular In Your Department"
 * Recommends approved listings from sellers in the same college and branch as the user.
 */
exports.getPopularInDepartment = async (userId, limit = 6) => {
  try {
    // 1. Fetch user's college and branch
    const userRes = await db.query('SELECT college, branch FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0 || !userRes.rows[0].college) {
      // Fallback if user profile college not set
      const popularQuery = `
        SELECT b.*, u.name as seller_name,
               (SELECT COUNT(*) FROM book_views bv WHERE bv.book_id = b.id) as view_count
        FROM books b
        JOIN users u ON b.seller_id = u.id
        WHERE b.status = 'approved' AND b.seller_id != $1
        ORDER BY view_count DESC, b.created_at DESC
        LIMIT $2;
      `;
      const fallbackResult = await db.query(popularQuery, [userId, limit]);
      return fallbackResult.rows;
    }

    const { college, branch } = userRes.rows[0];

    const query = `
      SELECT b.*, u.name as seller_name,
             (SELECT COUNT(*) FROM book_views bv WHERE bv.book_id = b.id) as view_count
      FROM books b
      JOIN users u ON b.seller_id = u.id
      WHERE b.status = 'approved' 
        AND b.seller_id != $1
        AND u.college = $2
        ${branch ? 'AND u.branch = $3' : ''}
      ORDER BY view_count DESC, b.created_at DESC
      LIMIT $4;
    `;

    const params = branch 
      ? [userId, college, branch, limit]
      : [userId, college, limit];

    const result = await db.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Error in getPopularInDepartment:', err);
    return [];
  }
};
