const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/register - Registrácia
router.post('/register', register);

// POST /api/auth/login - Prihlásenie
router.post('/login', login);

// GET /api/auth/profile - Získať profil (vyžaduje autentifikáciu)
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
