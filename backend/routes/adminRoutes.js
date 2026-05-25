// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');

// All admin routes are protected behind auth and role checks
router.use(auth);
router.use(checkRole(['admin']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/listings', adminController.getAllListings);

router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/suspend', adminController.suspendUser);
router.put('/users/:id/activate', adminController.activateUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.get('/users/:id/activity', adminController.getUserActivity);

module.exports = router;
