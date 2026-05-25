const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;

    // Direct check to reject active sessions of banned/suspended users
    const userRes = await db.query('SELECT status FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'User account not found' });
    }
    
    const userStatus = userRes.rows[0].status;
    if (userStatus === 'banned') {
      return res.status(403).json({ message: 'Your account has been banned by an administrator.' });
    }
    if (userStatus === 'suspended') {
      return res.status(403).json({ message: 'Your account is suspended. Please contact support.' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
