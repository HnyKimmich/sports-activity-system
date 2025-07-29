const express = require('express');
const router = express.Router();
const UserService = require('../services/userService.cjs');
const multer = require('multer');
const path = require('path');
const AVATAR_DIR = path.join(__dirname, '../avatars');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// 注册
router.post('/register', async (req, res) => {
  const result = await UserService.register(req.body);
  res.status(result.code).json(result);
});
// 登录
router.post('/login', async (req, res) => {
  const result = await UserService.login(req.body);
  res.status(result.code).json(result);
});
// 获取个人信息
router.get('/profile', async (req, res) => {
  const result = await UserService.getProfile(req.query);
  res.status(result.code).json(result);
});
// 更新个人信息
router.post('/profile', async (req, res) => {
  const result = await UserService.updateProfile(req.body);
  res.status(result.code).json(result);
});
// 上传头像
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  const result = await UserService.uploadAvatar(req, res);
  res.status(result.code).json(result);
});

// 获取我的活动
router.get('/my-activities', async (req, res) => {
  const result = await UserService.getMyActivities(req.query.username);
  res.status(result.code).json(result);
});

// 取消报名活动
router.delete('/cancel-registration', async (req, res) => {
  const { username, activityId } = req.body;
  const result = await UserService.removeRegisteredActivity(username, activityId);
  res.status(result.code).json(result);
});

module.exports = router; 