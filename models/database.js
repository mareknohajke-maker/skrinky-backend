// In-memory databáza (v produkcii použite napr. MongoDB, PostgreSQL)
class Database {
  constructor() {
    this.users = [];
    this.lockers = [];
    this.history = [];
    this.initialize();
  }

  initialize() {
    // Vytvorenie 12 skriniek
    for (let i = 1; i <= 12; i++) {
      this.lockers.push({
        id: `locker-${i}`,
        number: i,
        status: 'free', // 'free', 'occupied', 'reserved'
        reservedBy: null,
        reservedByName: null,
        reservedAt: null,
        reservedUntil: null,
        lastOpened: null,
      });
    }
  }

  // USERS
  createUser(userData) {
    this.users.push(userData);
    return userData;
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
}

module.exports = new Database();
