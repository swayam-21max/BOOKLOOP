const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

// All admin routes are protected
router.use(auth);
router.use(checkRole(['admin']));

router.get('/stats', adminController.getStats);
router.get('/users', auth, checkRole(['admin']), adminController.getUsers);
// router.get('/reviews', auth, checkRole(['admin']), adminController.getAllReviews);

module.exports = router;
