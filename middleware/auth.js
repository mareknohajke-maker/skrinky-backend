const jwt = require('jsonwebtoken');
const database = require('../models/database');

const authMiddleware = (req, res, next) => {
  try {
    // Získať token z headera
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token nebol poskytnutý' });
    }

    const token = authHeader.substring(7); // Odstráni "Bearer "

    // Overiť token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Nájsť používateľa
    const user = database.findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Používateľ neexistuje' });
    }

    // Pridať používateľa do requestu
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Neplatný token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token vypršal' });
    }
    return res.status(500).json({ error: 'Chyba autentifikácie' });
  }
};

const ownerOnly = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Prístup iba pre správcu' });
  }
  next();
};

module.exports = { authMiddleware, ownerOnly };
