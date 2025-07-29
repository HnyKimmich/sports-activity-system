const express = require('express');
const router = express.Router();
const ActivityService = require('../services/activityService.cjs');
const multer = require('multer');
const path = require('path');
const IMAGES_DIR = path.join(__dirname, '../activities/images');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// 申报活动（支持图片上传）
router.post('/apply', upload.single('image'), async (req, res) => {
  const data = req.body;
  if (req.file) {
    data.image = `/activities/images/${req.file.filename}`;
  }
  const result = await ActivityService.apply(data);
  res.status(result.code).json(result);
});
// 获取所有活动
router.get('/', async (req, res) => {
  const result = await ActivityService.getAll();
  res.status(result.code).json(result);
});

// 获取单个活动详情
router.get('/:id', async (req, res) => {
  const result = await ActivityService.getById(req.params.id);
  res.status(result.code).json(result);
});
// 报名活动
router.post('/register', async (req, res) => {
  const result = await ActivityService.register(req.body);
  res.status(result.code).json(result);
});

// 取消报名活动
router.post('/cancel-registration', async (req, res) => {
  const result = await ActivityService.cancelRegistration(req.body);
  res.status(result.code).json(result);
});

// 删除活动
router.delete('/:id', async (req, res) => {
  const result = await ActivityService.deleteActivity({
    id: req.params.id,
    username: req.body.username
  });
  res.status(result.code).json(result);
});

// 获取活动评论
router.get('/:id/comments', async (req, res) => {
  try {
    const activityId = req.params.id;
    const fs = require('fs');
    const commentsPath = path.join(__dirname, '../comments.json');
    
    let comments = [];
    if (fs.existsSync(commentsPath)) {
      comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
    }
    
    // 筛选出该活动的评论
    const activityComments = comments.filter(comment => comment.activityId === activityId);
    
    // 获取用户信息以添加头像
    const usersPath = path.join(__dirname, '../users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    // 为每条评论添加用户头像信息
    const commentsWithAvatars = activityComments.map(comment => {
      const user = users.find(u => u.username === comment.username);
      return {
        ...comment,
        avatar: user ? user.avatar : null
      };
    });
    
    res.json(commentsWithAvatars);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// 添加活动评论
router.post('/:id/comments', async (req, res) => {
  try {
    const activityId = req.params.id;
    const { username, content } = req.body;
    
    if (!username || !content) {
      return res.status(400).json({ error: 'Username and content are required' });
    }
    
    const fs = require('fs');
    const commentsPath = path.join(__dirname, '../comments.json');
    
    let comments = [];
    if (fs.existsSync(commentsPath)) {
      comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
    }
    
    // 创建新评论
    const newComment = {
      id: Date.now().toString(),
      activityId,
      username,
      content,
      createdAt: new Date().toISOString()
    };
    
    comments.push(newComment);
    
    // 保存评论
    fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 2));
    
    // 获取用户头像信息
    const usersPath = path.join(__dirname, '../users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const user = users.find(u => u.username === username);
    
    const commentWithAvatar = {
      ...newComment,
      avatar: user ? user.avatar : null
    };
    
    res.status(200).json(commentWithAvatar);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 删除活动评论
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const fs = require('fs');
    const commentsPath = path.join(__dirname, '../comments.json');
    
    if (!fs.existsSync(commentsPath)) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    let comments = JSON.parse(fs.readFileSync(commentsPath, 'utf8'));
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // 检查是否为评论作者
    if (comments[commentIndex].username !== username) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }
    
    // 删除评论
    comments.splice(commentIndex, 1);
    fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 2));
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router; 