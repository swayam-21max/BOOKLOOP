// backend/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

router.get('/:id', profileController.getProfile);
router.get('/:id/trust-score', profileController.getSellerTrustScore);
router.put('/', auth, profileController.updateProfile);

module.exports = router;
