const database = require('../models/database');

// Získať všetky skupiny
const getAllGroups = (req, res) => {
  try {
    const groups = database.getAllGroups();
    
    // Pridaj počet skriniek pre každú skupinu
    const groupsWithCount = groups.map(group => {
      const lockerCount = database.lockers.filter(l => l.group === group.id).length;
      return {
        ...group,
        lockerCount
      };
    });
    
    res.json(groupsWithCount);
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ error: 'Chyba pri načítaní skupín' });
  }
};

// Získať jednu skupinu
const getGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const group = database.findGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Skupina nenájdená' });
    }
    
    const lockerCount = database.lockers.filter(l => l.group === group.id).length;
    
    res.json({
      ...group,
      lockerCount
    });
  } catch (error) {
    console.error('Error getting group:', error);
    res.status(500).json({ error: 'Chyba pri načítaní skupiny' });
  }
};

// Vytvoriť novú skupinu (len owner)
const createGroup = (req, res) => {
  try {
    const { name, code, color, icon, description } = req.body;
    
    // Validácia
    if (!name) {
      return res.status(400).json({ error: 'Názov skupiny je povinný' });
    }
    
    // Skontroluj či kód už existuje
    if (code && database.findGroupByCode(code)) {
      return res.status(400).json({ error: 'Skupina s týmto kódom už existuje' });
    }
    
    const group = database.createGroup({
      name,
      code,
      color,
      icon,
      description
    });
    
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Chyba pri vytváraní skupiny' });
  }
};

// Upraviť skupinu (len owner)
const updateGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, color, icon, description } = req.body;
    
    const group = database.findGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Skupina nenájdená' });
    }
    
    if (group.isDefault) {
      return res.status(403).json({ error: 'Nemožno upraviť predvolenú skupinu' });
    }
    
    const updatedGroup = database.updateGroup(groupId, {
      name,
      color,
      icon,
      description
    });
    
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Chyba pri úprave skupiny' });
  }
};

// Zmazať skupinu (len owner)
const deleteGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = database.findGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Skupina nenájdená' });
    }
    
    if (group.isDefault) {
      return res.status(403).json({ error: 'Nemožno zmazať predvolenú skupinu' });
    }
    
    // Skontroluj či niekto používa túto skupinu
    const lockersInGroup = database.lockers.filter(l => l.group === groupId);
    if (lockersInGroup.length > 0) {
      return res.status(400).json({ 
        error: `Nemožno zmazať skupinu. ${lockersInGroup.length} skriniek používa túto skupinu.` 
      });
    }
    
    const deleted = database.deleteGroup(groupId);
    if (!deleted) {
      return res.status(500).json({ error: 'Chyba pri mazaní skupiny' });
    }
    
    res.json({ message: 'Skupina bola zmazaná' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Chyba pri mazaní skupiny' });
  }
};

module.exports = {
  getAllGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup
};