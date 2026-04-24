const express = require('express');
const router = express.Router();
const {
  getHistory,
  getLockerHistory,
  getUserHistory,
} = require('../controllers/historyController');
const { authMiddleware, ownerOnly } = require('../middleware/auth');

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

// GET /api/history - Získať celú históriu (len owner)
router.get('/', ownerOnly, getHistory);

// GET /api/history/locker/:lockerId - Získať históriu skrinky (len owner)
router.get('/locker/:lockerId', ownerOnly, getLockerHistory);

// GET /api/history/me - Získať vlastnú históriu
router.get('/me', getUserHistory);

module.exports = router;
