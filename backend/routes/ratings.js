// backend/routes/ratings.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// @route   POST api/ratings
// @desc    Submit a rating
// @access  Private
router.post('/', auth, ratingController.submitRating);

// @route   GET api/ratings/:user_id
// @desc    Get user ratings and aggregate score
// @access  Public
router.get('/:user_id', ratingController.getUserRatings);

// @route   DELETE api/ratings/:id
// @desc    Delete a rating (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, role('admin'), ratingController.deleteRating);

module.exports = router;
