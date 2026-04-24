const database = require('../models/database');

// Získať celú históriu (len pre owner)
const getHistory = (req, res) => {
  try {
    const history = database.getAllHistory();
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Chyba pri načítaní histórie' });
  }
};

// Získať históriu podľa skrinky (len pre owner)
const getLockerHistory = (req, res) => {
  try {
    const { lockerId } = req.params;
    const history = database.getHistoryByLocker(lockerId);
    res.json(history);
  } catch (error) {
    console.error('Get locker history error:', error);
    res.status(500).json({ error: 'Chyba pri načítaní histórie skrinky' });
  }
};

// Získať históriu používateľa
const getUserHistory = (req, res) => {
  try {
    const userId = req.user.id;
    const history = database.getHistoryByUser(userId);
    res.json(history);
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ error: 'Chyba pri načítaní histórie používateľa' });
  }
};

module.exports = {
  getHistory,
  getLockerHistory,
  getUserHistory,
};
