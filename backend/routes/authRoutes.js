const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login/verify', authController.verifyLoginOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/user/:id', authController.getUserById);

// Update profile picture
router.put('/profile/picture', auth, uploadProfile.single('profile_pic'), authController.updateProfilePic);

module.exports = router;
