const express = require('express');
const router = express.Router();
const { addWishlist, getWishlists, deleteWishlist } = require('../controllers/wishlistController');
const auth = require('../middleware/auth');

router.post('/', auth, addWishlist);
router.get('/', auth, getWishlists);
router.delete('/:id', auth, deleteWishlist);

module.exports = router;
