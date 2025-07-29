const ActivityRepository = require('../repositories/activityRepository.cjs');
const UserRepository = require('../repositories/userRepository.cjs');

class ActivityService {
  static async apply({ title, type, location, startTime, duration, requiredPeople, pricePerPerson, description, username, email, image }) {
    if (!title || !type || !location || !startTime || !duration || !requiredPeople) {
      return { code: 400, message: '信息不完整' };
    }
    const activities = ActivityRepository.readActivities();
    const id = Date.now();
    const newActivity = {
      id,
      title,
      type,
      location,
      startTime,
      duration,
      requiredPeople,
      pricePerPerson: pricePerPerson || 0,
      description: description || '',
      image: image || '',
      registeredCount: 1,
      registeredUsers: [{ username, email }]
    };
    activities.push(newActivity);
    ActivityRepository.writeActivities(activities);
    
    // 将活动ID添加到用户的创建活动列表
    const UserService = require('./userService.cjs');
    await UserService.addCreatedActivity(username, id);
    
    return { code: 201, message: '活动申报成功', data: newActivity };
  }
  static async getAll() {
    const activities = ActivityRepository.readActivities();
    return { code: 200, message: '获取成功', data: activities };
  }

  static async getById(id) {
    const activities = ActivityRepository.readActivities();
    const activity = activities.find(act => act.id === parseInt(id));
    if (!activity) {
      return { code: 404, message: '活动不存在' };
    }
    return { code: 200, message: '获取成功', data: activity };
  }
  static async register({ id, username }) {
    if (!id || !username) return { code: 400, message: '信息不完整' };
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '用户不存在' };
    const email = user.email;
    const activities = ActivityRepository.readActivities();
    const activity = activities.find(act => act.id === id);
    if (!activity) return { code: 404, message: '活动不存在' };
    if (activity.registeredUsers.find(u => u.username === username || u.email === email)) {
      return { code: 409, message: '已报名' };
    }
    if (activity.registeredCount >= activity.requiredPeople) {
      return { code: 403, message: '人数已满' };
    }
    const now = Date.now();
    if (new Date(activity.startTime).getTime() - now < 24 * 60 * 60 * 1000) {
      return { code: 403, message: '距离开始不足24小时，无法报名' };
    }
    activity.registeredUsers.push({ username, email });
    activity.registeredCount++;
    ActivityRepository.writeActivities(activities);
    
    // 将活动ID添加到用户的报名活动列表
    const UserService = require('./userService.cjs');
    await UserService.addRegisteredActivity(username, id);
    
    return { code: 200, message: '报名成功', data: activity };
  }

  static async cancelRegistration({ id, username }) {
    if (!id || !username) return { code: 400, message: '信息不完整' };
    const user = UserRepository.findByUsername(username);
    if (!user) return { code: 404, message: '用户不存在' };
    const email = user.email;
    const activities = ActivityRepository.readActivities();
    const activity = activities.find(act => act.id === id);
    if (!activity) return { code: 404, message: '活动不存在' };
    
    const userIndex = activity.registeredUsers.findIndex(u => u.username === username || u.email === email);
    if (userIndex === -1) {
      return { code: 404, message: '未找到报名记录' };
    }
    
    // 从活动的报名用户列表中移除
    activity.registeredUsers.splice(userIndex, 1);
    activity.registeredCount--;
    ActivityRepository.writeActivities(activities);
    
    // 从用户的报名活动列表中移除
    const UserService = require('./userService.cjs');
    await UserService.removeRegisteredActivity(username, id);
    
    return { code: 200, message: '取消报名成功', data: activity };
  }

  static async deleteActivity({ id, username }) {
    if (!id || !username) return { code: 400, message: '信息不完整' };
    
    const activities = ActivityRepository.readActivities();
    const activityIndex = activities.findIndex(act => act.id === parseInt(id));
    if (activityIndex === -1) return { code: 404, message: '活动不存在' };
    
    const activity = activities[activityIndex];
    
    // 检查是否是活动创建者
    if (!activity.registeredUsers.some(user => user.username === username)) {
      return { code: 403, message: '只有活动创建者可以删除活动' };
    }
    
    // 删除活动
    activities.splice(activityIndex, 1);
    ActivityRepository.writeActivities(activities);
    
    // 从创建者的活动列表中移除
    const UserService = require('./userService.cjs');
    const users = UserRepository.readUsers();
    users.forEach(user => {
      if (user.createdActivities && user.createdActivities.includes(parseInt(id))) {
        user.createdActivities = user.createdActivities.filter(actId => actId !== parseInt(id));
      }
      if (user.registeredActivities && user.registeredActivities.includes(parseInt(id))) {
        user.registeredActivities = user.registeredActivities.filter(actId => actId !== parseInt(id));
      }
    });
    UserRepository.writeUsers(users);
    
    return { code: 200, message: '活动删除成功' };
  }
}

module.exports = ActivityService; 