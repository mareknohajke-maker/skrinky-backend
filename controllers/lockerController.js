const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');

// Pomocná funkcia pre zápis do histórie
const addToHistory = (lockerId, lockerNumber, userId, userName, action) => {
  const entry = {
    id: uuidv4(),
    lockerId,
    lockerNumber,
    userId,
    userName,
    action, // 'reserved', 'opened', 'closed', 'released'
    timestamp: new Date().toISOString(),
  };
  database.addHistoryEntry(entry);
  return entry;
};

// Získať všetky skrinky
const getAllLockers = (req, res) => {
  try {
    const lockers = database.getAllLockers();
    res.json(lockers);
  } catch (error) {
    console.error('Get lockers error:', error);
    res.status(500).json({ error: 'Chyba pri načítaní skriniek' });
  }
};

// Rezervovať skrinku (len member)
const reserveLocker = (req, res) => {
  try {
    const { lockerId } = req.params;
    const user = req.user;

    // Iba členovia môžu rezervovať
    if (user.role !== 'member') {
      return res.status(403).json({ error: 'Iba členovia môžu rezervovať skrinky' });
    }

    const locker = database.findLockerById(lockerId);
    if (!locker) {
      return res.status(404).json({ error: 'Skrinka nenájdená' });
    }

    // Skrinka musí byť voľná
    if (locker.status !== 'free') {
      return res.status(400).json({ error: 'Skrinka nie je voľná' });
    }

    // Kontrola, či používateľ už nemá rezervovanú inú skrinku
    const userHasReservation = database.getAllLockers().some(
      l => l.reservedBy === user.id && l.status === 'reserved'
    );

    if (userHasReservation) {
      return res.status(400).json({ error: 'Už máte rezervovanú skrinku' });
    }

    // Rezervácia na max 1 deň (24 hodín)
    const now = new Date();
    const reservedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const updatedLocker = database.updateLocker(lockerId, {
      status: 'reserved',
      reservedBy: user.id,
      reservedByName: `${user.firstName} ${user.lastName}`,
      reservedAt: now.toISOString(),
      reservedUntil: reservedUntil.toISOString(),
    });

    // Zápis do histórie
    addToHistory(
      lockerId,
      locker.number,
      user.id,
      `${user.firstName} ${user.lastName}`,
      'reserved'
    );

    res.json(updatedLocker);
  } catch (error) {
    console.error('Reserve locker error:', error);
    res.status(500).json({ error: 'Chyba pri rezervácii' });
  }
};

// Otvoriť skrinku
const openLocker = (req, res) => {
  try {
    const { lockerId } = req.params;
    const user = req.user;

    const locker = database.findLockerById(lockerId);
    if (!locker) {
      return res.status(404).json({ error: 'Skrinka nenájdená' });
    }

    // Owner môže otvoriť hocikedy
    // Member môže otvoriť len svoju rezervovanú skrinku
    if (user.role === 'member') {
      if (locker.status !== 'reserved' || locker.reservedBy !== user.id) {
        return res.status(403).json({ error: 'Nemôžete otvoriť túto skrinku' });
      }
    }

    const updatedLocker = database.updateLocker(lockerId, {
      status: 'occupied',
      lastOpened: new Date().toISOString(),
    });

    // Zápis do histórie
    addToHistory(
      lockerId,
      locker.number,
      user.id,
      `${user.firstName} ${user.lastName}`,
      'opened'
    );

    res.json(updatedLocker);
  } catch (error) {
    console.error('Open locker error:', error);
    res.status(500).json({ error: 'Chyba pri otváraní skrinky' });
  }
};

// Zatvoriť skrinku
const closeLocker = (req, res) => {
  try {
    const { lockerId } = req.params;
    const user = req.user;

    const locker = database.findLockerById(lockerId);
    if (!locker) {
      return res.status(404).json({ error: 'Skrinka nenájdená' });
    }

    // Owner môže zatvoriť hocikedy
    // Member môže zatvoriť len svoju skrinku
    if (user.role === 'member') {
      if (locker.reservedBy !== user.id) {
        return res.status(403).json({ error: 'Nemôžete zatvoriť túto skrinku' });
      }
    }

    // Po zatvorení ostáva reserved (ak bola reserved)
    const updatedLocker = database.updateLocker(lockerId, {
      status: locker.reservedBy ? 'reserved' : 'free',
    });

    // Zápis do histórie
    addToHistory(
      lockerId,
      locker.number,
      user.id,
      `${user.firstName} ${user.lastName}`,
      'closed'
    );

    res.json(updatedLocker);
  } catch (error) {
    console.error('Close locker error:', error);
    res.status(500).json({ error: 'Chyba pri zatváraní skrinky' });
  }
};

// Uvoľniť skrinku
const releaseLocker = (req, res) => {
  try {
    const { lockerId } = req.params;
    const user = req.user;

    const locker = database.findLockerById(lockerId);
    if (!locker) {
      return res.status(404).json({ error: 'Skrinka nenájdená' });
    }

    // Owner môže uvoľniť hocikedy
    // Member môže uvoľniť len svoju rezervovanú skrinku
    if (user.role === 'member') {
      if (locker.reservedBy !== user.id) {
        return res.status(403).json({ error: 'Nemôžete uvoľniť túto skrinku' });
      }
    }

    const updatedLocker = database.updateLocker(lockerId, {
      status: 'free',
      reservedBy: null,
      reservedByName: null,
      reservedAt: null,
      reservedUntil: null,
    });

    // Zápis do histórie
    addToHistory(
      lockerId,
      locker.number,
      user.id,
      `${user.firstName} ${user.lastName}`,
      'released'
    );

    res.json(updatedLocker);
  } catch (error) {
    console.error('Release locker error:', error);
    res.status(500).json({ error: 'Chyba pri uvoľňovaní skrinky' });
  }
};

module.exports = {
  getAllLockers,
  reserveLocker,
  openLocker,
  closeLocker,
  releaseLocker,
};
