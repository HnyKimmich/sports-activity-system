const UserRepository = require('../repositories/userRepository.cjs');
const { deleteAvatar } = require('../utils/avatarUtil.cjs');
const path = require('path');

class UserService {
  static async register({ username, password, email }) {
    if (!username || !password || !email) return { code: 400, message: '信息不完整' };
    const users = UserRepository.readUsers();
    if (users.find(u => u.email === email)) return { code: 409, message: '该邮箱已被注册' };
    users.push({ 
      username, 
      password, 
      email, 
      gender: '', 
      age: '', 
      sport: '', 
      signature: '', 
      avatar: '',
      createdActivities: [],  // 用户创建的活动ID列表
      registeredActivities: [] // 用户报名的活动ID列表
    });
    UserRepository.writeUsers(users);
    return { code: 201, message: '注册成功', data: { username, email } };
  }
  static async login({ username, password }) {
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '该用户不存在' };
    if (user.password !== password) return { code: 401, message: '密码错误' };
    return { code: 200, message: '登录成功', data: { username, email: user.email } };
  }
  static async getProfile({ username }) {
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '用户不存在' };
    const { password, ...profile } = user;
    return { code: 200, message: '获取成功', data: profile };
  }
  static async updateProfile({ username, gender, age, sport, signature, avatar }) {
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '用户不存在' };
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = age;
    if (sport !== undefined) user.sport = sport;
    if (signature !== undefined) user.signature = signature;
    if (avatar !== undefined) user.avatar = avatar;
    UserRepository.updateUser(user);
    return { code: 200, message: '更新成功', data: user };
  }
  static async uploadAvatar(req, res) {
    const { username } = req.body;
    if (!req.file) return { code: 400, message: '未上传文件' };
    if (!username) return { code: 400, message: '缺少用户名' };
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '用户不存在' };
    if (user.avatar) deleteAvatar(user.avatar);
    user.avatar = `/${path.basename(req.file.filename)}`;
    UserRepository.updateUser(user);
    return { code: 200, message: '上传成功', path: user.avatar };
  }

  // 添加活动到用户的创建列表
  static async addCreatedActivity(username, activityId) {
    const user = UserRepository.findByUsername(username);
    if (!user) return false;
    if (!user.createdActivities) user.createdActivities = [];
    if (!user.createdActivities.includes(activityId)) {
      user.createdActivities.push(activityId);
      UserRepository.updateUser(user);
    }
    return true;
  }

  // 添加活动到用户的报名列表
  static async addRegisteredActivity(username, activityId) {
    const user = UserRepository.findByUsername(username);
    if (!user) return false;
    if (!user.registeredActivities) user.registeredActivities = [];
    if (!user.registeredActivities.includes(activityId)) {
      user.registeredActivities.push(activityId);
      UserRepository.updateUser(user);
    }
    return true;
  }

  // 从用户报名列表中移除活动
  static async removeRegisteredActivity(username, activityId) {
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '用户不存在' };
    
    if (!user.registeredActivities) user.registeredActivities = [];
    const index = user.registeredActivities.indexOf(activityId);
    if (index > -1) {
      user.registeredActivities.splice(index, 1);
      UserRepository.updateUser(user);
      return { code: 200, message: '取消报名成功' };
    }
    
    return { code: 400, message: '未找到该报名记录' };
  }

  // 获取用户参与的所有活动
  static async getMyActivities(username) {
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '用户不存在' };
    
    const ActivityRepository = require('../repositories/activityRepository.cjs');
    const activities = ActivityRepository.readActivities();
    
    const createdActivities = user.createdActivities || [];
    const registeredActivities = user.registeredActivities || [];
    
    const myActivities = [];
    
    // 添加用户创建的活动
    createdActivities.forEach(activityId => {
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        myActivities.push({ ...activity, isCreator: true });
      }
    });
    
    // 添加用户报名的活动
    registeredActivities.forEach(activityId => {
      const activity = activities.find(a => a.id === activityId);
      if (activity && !myActivities.find(a => a.id === activityId)) {
        myActivities.push({ ...activity, isCreator: false });
      }
    });
    
    return { code: 200, message: '获取成功', data: myActivities };
  }
}

module.exports = UserService; 