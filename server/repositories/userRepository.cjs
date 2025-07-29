const fs = require('fs');
const path = require('path');
const USERS_FILE = path.join(__dirname, '../users.json');

class UserRepository {
  static readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    try { return JSON.parse(data); } catch { return []; }
  }
  static writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  }
  static findByUsername(username) {
    return this.readUsers().find(u => u.username === username);
  }
  static updateUser(user) {
    const users = this.readUsers();
    const idx = users.findIndex(u => u.username === user.username);
    if (idx !== -1) users[idx] = user;
    this.writeUsers(users);
  }
}
module.exports = UserRepository; 