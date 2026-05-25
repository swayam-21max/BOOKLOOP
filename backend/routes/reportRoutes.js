// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

// Users can submit reports
router.post('/', auth, reportController.createReport);

// Admin moderation controls
router.get('/', auth, checkRole(['admin']), reportController.getAllReports);
router.put('/:id/status', auth, checkRole(['admin']), reportController.updateReportStatus);

module.exports = router;
