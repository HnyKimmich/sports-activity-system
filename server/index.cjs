const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');

const userRoutes = require('./routes/userRoutes.cjs');
const activityRoutes = require('./routes/activityRoutes.cjs');

// 获取本机IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const app = express();
const PORT = 3001;
const localIP = getLocalIP();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);

app.use('/avatars', express.static(path.join(__dirname, 'avatars')));
app.use('/activities/images', express.static(path.join(__dirname, 'activities/images')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器已启动！`);
  console.log(`  本地访问:   http://localhost:${PORT}`);
  console.log(`  网络访问:   http://${localIP}:${PORT}`);
  console.log(`  同网络设备可通过 http://${localIP}:${PORT} 访问后端API`);
}); 