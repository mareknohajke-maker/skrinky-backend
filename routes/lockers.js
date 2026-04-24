const express = require('express');
const router = express.Router();
const {
  getAllLockers,
  reserveLocker,
  openLocker,
  closeLocker,
  releaseLocker,
} = require('../controllers/lockerController');
const { authMiddleware } = require('../middleware/auth');

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

// GET /api/lockers - Získať všetky skrinky
router.get('/', getAllLockers);

// POST /api/lockers/:lockerId/reserve - Rezervovať skrinku
router.post('/:lockerId/reserve', reserveLocker);

// POST /api/lockers/:lockerId/open - Otvoriť skrinku
router.post('/:lockerId/open', openLocker);

// POST /api/lockers/:lockerId/close - Zatvoriť skrinku
router.post('/:lockerId/close', closeLocker);

// POST /api/lockers/:lockerId/release - Uvoľniť skrinku
router.post('/:lockerId/release', releaseLocker);

module.exports = router;
