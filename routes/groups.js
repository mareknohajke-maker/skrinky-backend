const express = require('express');
const router = express.Router();
const { authMiddleware, ownerOnly } = require('../middleware/auth');
const {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup
} = require('../controllers/groupController');

// Všetky routes vyžadujú autentifikáciu
router.use(authMiddleware);

// GET /api/groups - Získať všetky skupiny
router.get('/', getAllGroups);

// GET /api/groups/:groupId - Získať jednu skupinu
router.get('/:groupId', getGroup);

// POST /api/groups - Vytvoriť skupinu (len owner)
router.post('/', ownerOnly, createGroup);

// PUT /api/groups/:groupId - Upraviť skupinu (len owner)
router.put('/:groupId', ownerOnly, updateGroup);

// DELETE /api/groups/:groupId - Zmazať skupinu (len owner)
router.delete('/:groupId', ownerOnly, deleteGroup);

module.exports = router;