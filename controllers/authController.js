const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');

// Generovanie JWT tokenu
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token platný 30 dní
  });
};

// Registrácia
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, gender, password } = req.body;

    // Validácia
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Všetky polia sú povinné' });
    }

    // Skontroluj či email už existuje
    const existingUser = database.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email už existuje' });
    }

    // Hash hesla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Automatické pridelenie skupiny podľa pohlavia
    let userGroups = ['group-all']; // Default skupina
    
    if (gender === 'muž') {
      userGroups.push('group-men');
    } else if (gender === 'žena') {
      userGroups.push('group-women');
    }

    // Vytvor používateľa
    const user = database.createUser({
      firstName,
      lastName,
      email,
      phone,
      gender,
      password: hashedPassword,
      role: 'member',
      groups: userGroups  // NOVÉ - pridelené skupiny!
    });

    // Vygeneruj JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Vráť používateľa bez hesla
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Chyba pri registrácii' });
  }
};

// Prihlásenie
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/meno a heslo sú povinné' });
    }

    // Nájsť používateľa podľa emailu alebo mena + priezviska
    let user = null;
    
    // Skús email
    if (identifier.includes('@')) {
      user = database.findUserByEmail(identifier);
    } else {
      // Skús meno + priezvisko (formát: "Ján Novák")
      const parts = identifier.trim().split(/\s+/);
      if (parts.length >= 2) {
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        user = database.findUserByName(firstName, lastName);
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Nesprávne prihlasovacie údaje' });
    }

    // Overenie hesla
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Nesprávne prihlasovacie údaje' });
    }

    // Generovanie tokenu
    const token = generateToken(user.id);
    console.log('🔑 Generated token:', token);
    // Odpoveď (bez hesla)
    const { password: _, ...userWithoutPassword } = user;
    console.log('📤 Sending response with token:', !!token);  // DEBUG
    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Chyba pri prihlásení' });
  }
};

// Získať profil aktuálneho používateľa
const getProfile = (req, res) => {
  try {
    const user = req.user;
    const { password: _, ...userWithoutPassword } = user;
    
    // Pridaj názvy skupín
    const userGroups = user.groups || ['group-all'];
    const groupDetails = userGroups.map(groupId => {
      const group = database.findGroupById(groupId);
      return group ? {
        id: group.id,
        name: group.name,
        code: group.code,
        color: group.color,
        icon: group.icon
      } : null;
    }).filter(g => g !== null);
    
    res.json({
      ...userWithoutPassword,
      groupDetails  // Pridané pre frontend
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Chyba pri načítaní profilu' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
