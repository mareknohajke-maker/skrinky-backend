const express = require('express');
const router = express.Router();
const { authMiddleware, ownerOnly } = require('../middleware/auth');
const { getProfile } = require('../controllers/authController');
const { getAllUsers, getUser, updateUserGroups } = require('../controllers/userController');

// GET /api/users/me - Môj profil (auth required)
router.get('/me', authMiddleware, getProfile);

// GET /api/users - Všetci používatelia (len owner)
router.get('/', authMiddleware, ownerOnly, getAllUsers);

// GET /api/users/:userId - Jeden používateľ (len owner)
router.get('/:userId', authMiddleware, ownerOnly, getUser);

// PUT /api/users/:userId/groups - Aktualizovať skupiny (len owner)
router.put('/:userId/groups', authMiddleware, ownerOnly, updateUserGroups);

module.exports = router;