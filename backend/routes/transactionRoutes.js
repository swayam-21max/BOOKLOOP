// backend/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.get('/my-transactions', auth, transactionController.getMyTransactions);
router.get('/leaderboard', transactionController.getLeaderboard);

module.exports = router;
