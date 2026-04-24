const express = require('express');
const router = express.Router();
const { authMiddleware, ownerOnly } = require('../middleware/auth');
const {
  getAllLockers,
  reserveLocker,
  openLocker,
  closeLocker,
  releaseLocker,
  createLocker,
  updateLockerDetails,
  deleteLockerPermanently
} = require('../controllers/lockerController');

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

// GET /api/lockers - Získať všetky skrinky (filtrované podľa skupín)
router.get('/', getAllLockers);

// POST /api/lockers/:lockerId/reserve - Rezervovať skrinku
router.post('/:lockerId/reserve', reserveLocker);

// POST /api/lockers/:lockerId/open - Otvoriť skrinku
router.post('/:lockerId/open', openLocker);

// POST /api/lockers/:lockerId/close - Zatvoriť skrinku
router.post('/:lockerId/close', closeLocker);

// POST /api/lockers/:lockerId/release - Uvoľniť skrinku
router.post('/:lockerId/release', releaseLocker);

// POST /api/lockers - Vytvoriť novú skrinku (len owner)
router.post('/', ownerOnly, createLocker);

// PUT /api/lockers/:lockerId - Upraviť detaily skrinky (len owner)
router.put('/:lockerId', ownerOnly, updateLockerDetails);

// DELETE /api/lockers/:lockerId - Zmazať skrinku (len owner)
router.delete('/:lockerId', ownerOnly, deleteLockerPermanently);

module.exports = router;