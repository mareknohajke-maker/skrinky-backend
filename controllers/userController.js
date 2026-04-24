const database = require('../models/database');

// Získať všetkých používateľov (len owner)
const getAllUsers = (req, res) => {
  try {
    const users = database.users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      
      // Pridaj detaily skupín
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
      
      return {
        ...userWithoutPassword,
        groupDetails
      };
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Chyba pri načítaní používateľov' });
  }
};

// Získať jedného používateľa (len owner)
const getUser = (req, res) => {
  try {
    const { userId } = req.params;
    const user = database.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Používateľ nenájdený' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    // Pridaj detaily skupín
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
      groupDetails
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Chyba pri načítaní používateľa' });
  }
};

// Aktualizovať skupiny používateľa (len owner)
const updateUserGroups = (req, res) => {
  try {
    const { userId } = req.params;
    const { groups } = req.body;
    
    if (!Array.isArray(groups)) {
      return res.status(400).json({ error: 'Skupiny musia byť pole' });
    }
    
    // Skontroluj či všetky skupiny existujú
    for (const groupId of groups) {
      if (!database.findGroupById(groupId)) {
        return res.status(400).json({ error: `Skupina ${groupId} nenájdená` });
      }
    }
    
    const user = database.updateUserGroups(userId, groups);
    if (!user) {
      return res.status(404).json({ error: 'Používateľ nenájdený' });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    // Pridaj detaily skupín
    const groupDetails = groups.map(groupId => {
      const group = database.findGroupById(groupId);
      return {
        id: group.id,
        name: group.name,
        code: group.code,
        color: group.color,
        icon: group.icon
      };
    });
    
    res.json({
      ...userWithoutPassword,
      groupDetails
    });
  } catch (error) {
    console.error('Error updating user groups:', error);
    res.status(500).json({ error: 'Chyba pri aktualizácii skupín' });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  updateUserGroups
};