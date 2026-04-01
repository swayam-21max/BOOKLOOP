const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');
const { uploadBooks } = require('../middleware/upload');

router.get('/', bookController.getBooks);
router.get('/pending', auth, checkRole(['admin']), bookController.getPendingBooks);
router.get('/my-books', auth, checkRole(['seller']), bookController.getMyBooks);
router.get('/:id', bookController.getBookById);

// Use uploadBooks.array('images', 4) to handle multiple images
router.post('/', auth, checkRole(['seller']), uploadBooks.array('images', 4), bookController.createBook);

router.put('/:id/status', auth, checkRole(['admin', 'seller']), bookController.updateBookStatus);
router.delete('/:id', auth, checkRole(['seller']), bookController.deleteBook);

module.exports = router;
