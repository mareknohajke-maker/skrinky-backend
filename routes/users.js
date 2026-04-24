const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getProfile } = require('../controllers/authController');

// GET /api/users/me - Získať profil aktuálneho používateľa
router.get('/me', authMiddleware, getProfile);

module.exports = router;
