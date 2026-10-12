const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public route: Login
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.post('/signature', verifyToken, upload.single('signature'), authController.uploadSignature);

module.exports = router;
