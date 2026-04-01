const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');
const { deleteFromCloudinary } = require('../middleware/upload');

/**
 * Registers a new user without OTP verification.
 * Sends a welcome email upon success.
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, location } = req.body;

    // 1. Basic validation
    if (!email || !name || !password) {
      return res.status(400).json({ message: 'All fields are required (name, email, password)' });
    }

    // 2. Check if user already exists
    const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 3. Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role, location, email_verified) VALUES ($1, $2, $3, $4, $5, true) RETURNING id, name, email, role, profile_pic',
      [name, email, hashedPassword, role || 'buyer', location]
    );

    // 4. Send Welcome Email
    await emailService.sendWelcomeEmail(email, name);

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: newUser.rows[0],
      message: 'Registration successful! Welcome to BOOKLOOP.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login Step 1: Verify credentials and send OTP via email.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Credentials valid, now generate and send OTP
    const otp = otpService.generateOTP();
    const otpHash = await otpService.hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes

    // Delete existing OTPs for this email and store new one
    await db.query('DELETE FROM otps WHERE identifier = $1', [email]);
    await db.query(
      'INSERT INTO otps (identifier, otp_hash, expires_at) VALUES ($1, $2, $3)',
      [email, otpHash, expiresAt]
    );

    // Send OTP via Email
    await otpService.sendOTP(email, otp);

    res.status(200).json({
      success: true,
      requiresOTP: true,
      message: `Login verification code sent to ${email}`
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login Step 2: Verify the OTP and issue a JWT token.
 */
exports.verifyLoginOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Check OTP record
    const otpData = await db.query('SELECT * FROM otps WHERE identifier = $1', [email]);
    if (otpData.rows.length === 0) {
      return res.status(401).json({ message: 'No verification code found' });
    }

    const { otp_hash, expires_at, attempts } = otpData.rows[0];

    if (new Date() > new Date(expires_at)) {
      return res.status(401).json({ message: 'Verification code has expired' });
    }

    if (attempts >= 3) {
      return res.status(429).json({ message: 'Too many failed attempts. Please login again.' });
    }

    const isOTPValid = await otpService.verifyOTP(otp, otp_hash);
    if (!isOTPValid) {
      await db.query('UPDATE otps SET attempts = attempts + 1 WHERE identifier = $1', [email]);
      return res.status(401).json({ message: 'Invalid verification code' });
    }

    // OTP verified, fetch user and issue token
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    // Cleanup OTP
    await db.query('DELETE FROM otps WHERE identifier = $1', [email]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    const { password: _, ...userData } = user;
    res.json({ success: true, token, user: userData });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves a user by their unique ID.
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await db.query('SELECT id, name, email, role, location, profile_pic, created_at FROM users WHERE id = $1', [req.params.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * Updates the user's profile picture.
 */
exports.updateProfilePic = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const imageUrl = req.file.path;

    // Delete old profile picture if it exists from Cloudinary
    const userResult = await db.query('SELECT profile_pic FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows[0]?.profile_pic) {
      await deleteFromCloudinary(userResult.rows[0].profile_pic);
    }

    const updatedUser = await db.query(
      'UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING id, name, email, role, profile_pic',
      [imageUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
