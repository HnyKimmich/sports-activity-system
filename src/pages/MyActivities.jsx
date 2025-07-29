import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyActivities() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const uname = localStorage.getItem('username') || '';
    setUsername(uname);
    loadMyActivities(uname);
  }, []);

  const loadMyActivities = (uname) => {
    setLoading(true);
    // 获取用户的活动信息
    fetch(`http://192.168.56.1:3001/api/users/my-activities?username=${encodeURIComponent(uname)}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setMyActivities(data.data);
        } else {
          setError(data.message || '获取活动信息失败');
        }
      })
      .catch(err => {
        setError('网络错误');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCancelRegistration = async (activityId) => {
    if (!confirm('确定要取消报名这个活动吗？')) {
      return;
    }

    try {
      const response = await fetch('http://192.168.56.1:3001/api/activities/cancel-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activityId,
          username: username
        }),
      });

      const result = await response.json();
      
      if (result.code === 200) {
        alert('取消报名成功！');
        // 重新加载活动列表
        loadMyActivities(username);
      } else {
        alert(result.message || '取消报名失败');
      }
    } catch (error) {
      console.error('取消报名失败:', error);
      alert('网络错误，请稍后重试');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm('确定要删除这个活动吗？删除后无法恢复！')) {
      return;
    }

    try {
      const response = await fetch(`http://192.168.56.1:3001/api/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        }),
      });

      const result = await response.json();
      
      if (result.code === 200) {
        alert('活动删除成功！');
        // 重新加载活动列表
        loadMyActivities(username);
      } else {
        alert(result.message || '删除失败');
      }
    } catch (error) {
      console.error('删除活动失败:', error);
      alert('网络错误，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-blue-600 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-8 py-6 bg-white/80 shadow-md rounded-b-2xl">
        <button
          onClick={() => navigate('/nav')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回活动列表
        </button>
        <div className="text-xl font-bold text-blue-800">我的活动</div>
        <div></div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {myActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">您还没有参与任何活动</div>
            <button
              onClick={() => navigate('/nav')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              去看看有什么活动
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 我申报的活动 */}
            {myActivities.some(activity => activity.isCreator) && (
              <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">我申报的活动</h2>
                <div className="space-y-4">
                  {myActivities
                    .filter(activity => activity.isCreator)
                    .map(activity => (
                      <div key={activity.id} className="bg-white/90 rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-2">{activity.title}</h3>
                            <div className="text-blue-600 text-sm mb-1">类型：{activity.type}</div>
                            <div className="text-blue-600 text-sm mb-1">地点：{activity.location}</div>
                            <div className="text-blue-600 text-sm mb-1">
                              开始时间：{new Date(activity.startTime).toLocaleString('zh-CN')}
                            </div>
                            <div className="text-blue-600 text-sm mb-1">持续时间：{activity.duration}</div>
                            <div className="text-blue-600 text-sm">
                              报名情况：{activity.registeredCount}/{activity.requiredPeople}人
                            </div>
                            {activity.description && (
                              <div className="mt-2 text-gray-600 text-sm">
                                <span className="font-medium">描述：</span>
                                <span>{activity.description.length > 50 ? activity.description.substring(0, 50) + '...' : activity.description}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm text-center">
                              我是发起人
                            </span>
                            <button
                              onClick={() => navigate(`/activity/${activity.id}`)}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              查看详情
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              删除活动
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 我报名的活动 */}
            {myActivities.some(activity => !activity.isCreator) && (
              <div>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">我报名的活动</h2>
                <div className="space-y-4">
                  {myActivities
                    .filter(activity => !activity.isCreator)
                    .map(activity => (
                      <div key={activity.id} className="bg-white/90 rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-blue-800 mb-2">{activity.title}</h3>
                            <div className="text-blue-600 text-sm mb-1">类型：{activity.type}</div>
                            <div className="text-blue-600 text-sm mb-1">地点：{activity.location}</div>
                            <div className="text-blue-600 text-sm mb-1">
                              开始时间：{new Date(activity.startTime).toLocaleString('zh-CN')}
                            </div>
                            <div className="text-blue-600 text-sm mb-1">持续时间：{activity.duration}</div>
                            <div className="text-blue-600 text-sm">
                              报名情况：{activity.registeredCount}/{activity.requiredPeople}人
                            </div>
                            {activity.description && (
                              <div className="mt-2 text-gray-600 text-sm">
                                <span className="font-medium">描述：</span>
                                <span>{activity.description.length > 50 ? activity.description.substring(0, 50) + '...' : activity.description}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 min-w-[120px]">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm text-center">
                              已报名
                            </span>
                            <button
                              onClick={() => navigate(`/activity/${activity.id}`)}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              查看详情
                            </button>
                            <button
                              onClick={() => handleCancelRegistration(activity.id)}
                              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              取消报名
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
