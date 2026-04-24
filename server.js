require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const database = require('./models/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/lockers', require('./routes/lockers'));
app.use('/api/history', require('./routes/history'));
app.use('/api/groups', require('./routes/groups'));
// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Aplikácia Skrinky API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
      },
      users: {
        me: 'GET /api/users/me',
      },
      lockers: {
        getAll: 'GET /api/lockers',
        reserve: 'POST /api/lockers/:lockerId/reserve',
        open: 'POST /api/lockers/:lockerId/open',
        close: 'POST /api/lockers/:lockerId/close',
        release: 'POST /api/lockers/:lockerId/release',
      },
      history: {
        getAll: 'GET /api/history (owner only)',
        getByLocker: 'GET /api/history/locker/:lockerId (owner only)',
        getMyHistory: 'GET /api/history/me',
      },
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Interná chyba servera',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint nenájdený' });
});

// Inicializácia owner účtu pri štarte
const initializeOwner = async () => {
  const ownerEmail = process.env.OWNER_EMAIL || 'admin@skrinky.sk';
  const existingOwner = database.findUserByEmail(ownerEmail);
  
  if (!existingOwner) {
    const hashedPassword = await bcrypt.hash(
      process.env.OWNER_PASSWORD || 'admin123',
      10
    );

    const owner = {
      id: uuidv4(),
      firstName: process.env.OWNER_FIRSTNAME || 'Admin',
      lastName: process.env.OWNER_LASTNAME || 'Správca',
      email: ownerEmail,
      phone: '+421900000000',
      gender: 'muž',
      password: hashedPassword,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };

    database.createUser(owner);
    console.log('✅ Owner účet vytvorený:');
    console.log(`   Email: ${ownerEmail}`);
    console.log(`   Heslo: ${process.env.OWNER_PASSWORD || 'admin123'}`);
  } else {
    console.log('✅ Owner účet už existuje');
  }
};

// Spustenie servera
const startServer = async () => {
  try {
    await initializeOwner();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 =================================');
      console.log(`🚀 Server beží na http://localhost:${PORT}`);
      console.log(`🚀 API: http://localhost:${PORT}/api`);
      console.log(`🚀 Health: http://localhost:${PORT}/health`);
      console.log('🚀 =================================');
      console.log('');
      console.log('📊 Dostupné skrinky:', database.getAllLockers().length);
      console.log('👥 Registrovaní používatelia:', database.getAllUsers().length);
      console.log('');
    });
  } catch (error) {
    console.error('Chyba pri štarte servera:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
