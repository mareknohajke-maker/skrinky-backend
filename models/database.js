const { v4: uuidv4 } = require('uuid');
// In-memory databáza (v produkcii použite napr. MongoDB, PostgreSQL)
class Database {
  constructor() {
    this.users = [];
    this.groups = [];
    this.lockers = [];
    this.history = [];
    this.initialize();
  }

initialize() {
  // NAJPRV vytvor skupiny
  this.groups = [
    {
      id: 'group-all',
      name: 'Všetci',
      code: 'all',
      color: '#9E9E9E',
      icon: '👥',
      description: 'Všeobecné skrinky pre všetkých',
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'group-men',
      name: 'Muži',
      code: 'men',
      color: '#2196F3',
      icon: '👨',
      description: 'Skrinky pre mužov',
      isDefault: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'group-women',
      name: 'Ženy',
      code: 'women',
      color: '#E91E63',
      icon: '👩',
      description: 'Skrinky pre ženy',
      isDefault: true,
      createdAt: new Date().toISOString()
    }
  ];

  // POTOM vytvor 12 skriniek s pridelenými skupinami
  for (let i = 1; i <= 12; i++) {
    let group, name;
    
    if (i <= 6) {
      // Skrinky 1-6: Muži
      group = 'group-men';
      name = `Muži - Skrinka ${i}`;
    } else if (i <= 10) {
      // Skrinky 7-10: Ženy
      group = 'group-women';
      name = `Ženy - Skrinka ${i}`;
    } else {
      // Skrinky 11-12: Všetci
      group = 'group-all';
      name = `Všetci - Skrinka ${i}`;
    }
    
    this.lockers.push({
      id: `locker-${i}`,
      number: i,
      name: name,
      group: group,
      status: 'free',
      reservedBy: null,
      reservedByName: null,
      reservedAt: null,
      reservedUntil: null,
      lastOpened: null,
      lastClosed: null,
      createdAt: new Date().toISOString()
    });
  }

  console.log('✅ Inicializácia dokončená:');
  console.log(`   📦 Skupiny: ${this.groups.length}`);
  console.log(`   🗄️  Skrinky: ${this.lockers.length}`);
  
  // Vypíš rozdelenie skriniek
  const menCount = this.lockers.filter(l => l.group === 'group-men').length;
  const womenCount = this.lockers.filter(l => l.group === 'group-women').length;
  const allCount = this.lockers.filter(l => l.group === 'group-all').length;
  
  console.log(`   👨 Muži: ${menCount} skriniek`);
  console.log(`   👩 Ženy: ${womenCount} skriniek`);
  console.log(`   👥 Všetci: ${allCount} skriniek`);
}

  // USERS
  createUser(userData) {
  const user = {
    id: `user-${uuidv4()}`,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email.toLowerCase(),
    phone: userData.phone,
    gender: userData.gender,
    password: userData.password, // už hashnuté
    role: userData.role || 'member',
    groups: userData.groups || ['group-all'],  // NOVÉ - default skupina
    createdAt: new Date().toISOString(),
  };
  this.users.push(user);
  return user;
}

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByName(firstName, lastName) {
    return this.users.find(
      u => u.firstName.toLowerCase() === firstName.toLowerCase() &&
           u.lastName.toLowerCase() === lastName.toLowerCase()
    );
  }

  getAllUsers() {
    return this.users;
  }

  // LOCKERS
  getAllLockers() {
  return this.lockers;
}

  findLockerById(id) {
    return this.lockers.find(l => l.id === id);
  }

  updateLocker(id, updates) {
    const index = this.lockers.findIndex(l => l.id === id);
    if (index !== -1) {
      this.lockers[index] = { ...this.lockers[index], ...updates };
      return this.lockers[index];
    }
    return null;
  }

  // HISTORY
  addHistoryEntry(entry) {
    this.history.push(entry);
    return entry;
  }

  getAllHistory() {
    return this.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getHistoryByLocker(lockerId) {
    return this.history
      .filter(h => h.lockerId === lockerId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getHistoryByUser(userId) {
    return this.history
      .filter(h => h.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // RESET (pre testovanie)
  reset() {
    this.users = [];
    this.lockers = [];
    this.history = [];
    this.initialize();
  }

  // ========== GROUPS ==========
createGroup(groupData) {
  const group = {
    id: `group-${uuidv4()}`,
    name: groupData.name,
    code: groupData.code || groupData.name.toLowerCase().replace(/\s+/g, '-'),
    color: groupData.color || '#9E9E9E',
    icon: groupData.icon || '📁',
    description: groupData.description || '',
    isDefault: false,
    createdAt: new Date().toISOString()
  };
  this.groups.push(group);
  return group;
}

getAllGroups() {
  return this.groups;
}

findGroupById(id) {
  return this.groups.find(g => g.id === id);
}

findGroupByCode(code) {
  return this.groups.find(g => g.code === code);
}

updateGroup(id, updates) {
  const index = this.groups.findIndex(g => g.id === id);
  if (index === -1) return null;
  
  this.groups[index] = {
    ...this.groups[index],
    ...updates,
    id: this.groups[index].id, // Zachovaj ID
    isDefault: this.groups[index].isDefault // Zachovaj default flag
  };
  return this.groups[index];
}

deleteGroup(id) {
  const group = this.findGroupById(id);
  if (!group || group.isDefault) return false; // Nemožno zmazať default skupiny
  
  const index = this.groups.findIndex(g => g.id === id);
  if (index === -1) return false;
  
  this.groups.splice(index, 1);
  return true;
}

// ========== LOCKERS (rozšírené) ==========
createLocker(lockerData) {
  const locker = {
    id: `locker-${uuidv4()}`,
    number: lockerData.number,
    name: lockerData.name || `Skrinka ${lockerData.number}`,
    group: lockerData.group || 'group-all',
    status: 'free',
    reservedBy: null,
    reservedByName: null,
    reservedAt: null,
    reservedUntil: null,
    lastOpened: null,
    lastClosed: null,
    createdAt: new Date().toISOString()
  };
  this.lockers.push(locker);
  return locker;
}

deleteLocker(id) {
  const index = this.lockers.findIndex(l => l.id === id);
  if (index === -1) return false;
  
  this.lockers.splice(index, 1);
  return true;
}

// Rozšírenie updateLocker
updateLocker(id, updates) {
  const index = this.lockers.findIndex(l => l.id === id);
  if (index === -1) return null;
  
  this.lockers[index] = {
    ...this.lockers[index],
    ...updates,
    id: this.lockers[index].id // Zachovaj ID
  };
  return this.lockers[index];
}

// ========== USERS (rozšírené) ==========
updateUserGroups(userId, groupIds) {
  const user = this.findUserById(userId);
  if (!user) return null;
  
  user.groups = groupIds;
  return user;
}

}

module.exports = new Database();
