// backend/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addToFavorites);
router.delete('/:id', favoriteController.removeFromFavorites);

module.exports = router;
