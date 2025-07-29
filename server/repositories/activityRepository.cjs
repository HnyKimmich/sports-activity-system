const fs = require('fs');
const path = require('path');
const ACTIVITIES_FILE = path.join(__dirname, '../activities.json');

class ActivityRepository {
  static readActivities() {
    if (!fs.existsSync(ACTIVITIES_FILE)) return [];
    const data = fs.readFileSync(ACTIVITIES_FILE, 'utf-8');
    try { return JSON.parse(data); } catch { return []; }
  }
  static writeActivities(activities) {
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(activities, null, 2), 'utf-8');
  }
}
module.exports = ActivityRepository; 