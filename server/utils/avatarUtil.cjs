const fs = require('fs');
const path = require('path');
const AVATAR_DIR = path.join(__dirname, '../avatars');

function deleteAvatar(avatarPath) {
  if (!avatarPath) return;
  const fileName = path.basename(avatarPath);
  const filePath = path.join(AVATAR_DIR, fileName);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch {}
  }
}
module.exports = { deleteAvatar }; 