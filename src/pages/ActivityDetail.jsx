import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Comments from '../components/Comments';

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [participantAvatars, setParticipantAvatars] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const uname = localStorage.getItem('username') || '';
    setUsername(uname);
    
    // 获取活动详情
    fetch(`http://localhost:3001/api/activities/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setActivity(data.data);
          
          // 获取所有参与者的头像信息
          const usernames = data.data.registeredUsers?.map(user => user.username) || [];
          fetchParticipantAvatars(usernames);
        } else {
          setError(data.message || '活动不存在');
        }
      })
      .catch(err => {
        setError('网络错误');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 获取参与者头像信息
  const fetchParticipantAvatars = async (usernames) => {
    const avatarPromises = usernames.map(async (username) => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/profile?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        if (data.code === 200) {
          return { username, avatar: data.data.avatar || '' };
        }
        return { username, avatar: '' };
      } catch (error) {
        return { username, avatar: '' };
      }
    });

    const avatarResults = await Promise.all(avatarPromises);
    const avatarMap = {};
    avatarResults.forEach(result => {
      avatarMap[result.username] = result.avatar;
    });
    setParticipantAvatars(avatarMap);
  };

  const handleRegister = async () => {
    try {
      const res = await fetch('http://192.168.56.1:3001/api/activities/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id), username })
      });
      const data = await res.json();
      if (res.status === 200) {
        // 重新获取活动信息以更新报名状态
        window.location.reload();
      } else {
        alert(data.message || '报名失败');
      }
    } catch (err) {
      alert('网络错误');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-blue-600 text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={() => navigate('/nav')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回活动列表
          </button>
        </div>
      </div>
    );
  }

  const isRegistered = activity.registeredUsers?.some(u => u.username === username);
  const canRegister = !isRegistered && 
                     new Date(activity.startTime).getTime() - Date.now() >= 24 * 60 * 60 * 1000 &&
                     activity.registeredCount < activity.requiredPeople;

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
        <div className="text-xl font-bold text-blue-800">活动详情</div>
        <div></div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        {/* 活动基本信息 */}
        <div className="bg-white/90 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-blue-800 mb-4">{activity.title}</h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg">
                  {activity.type}
                </span>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg">
                  {activity.location}
                </span>
              </div>
            </div>
            {canRegister && (
              <button
                onClick={handleRegister}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                立即报名
              </button>
            )}
            {isRegistered && (
              <span className="px-8 py-3 bg-gray-100 text-gray-600 rounded-lg text-lg">
                已报名
              </span>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-lg text-gray-700">
            <div>
              <div className="mb-4">
                <span className="font-semibold text-blue-800">开始时间：</span>
                <div className="text-xl">{new Date(activity.startTime).toLocaleString('zh-CN')}</div>
              </div>
              <div className="mb-4">
                <span className="font-semibold text-blue-800">持续时间：</span>
                <div className="text-xl">{activity.duration || '未设置'}</div>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <span className="font-semibold text-blue-800">所需人数：</span>
                <span className="text-xl">{activity.requiredPeople}人</span>
              </div>
              <div className="mb-4">
                <span className="font-semibold text-blue-800">已报名：</span>
                <span className={`text-xl ${activity.registeredCount >= activity.requiredPeople ? 'text-red-500' : 'text-green-500'}`}>
                  {activity.registeredCount}人
                </span>
              </div>
              <div className="mb-4">
                <span className="font-semibold text-blue-800">人均费用：</span>
                <span className="text-xl">￥{activity.pricePerPerson || 0}</span>
              </div>
            </div>
          </div>
          
          {/* 活动描述 */}
          {activity.description && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">活动描述</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{activity.description}</p>
            </div>
          )}
        </div>

        {/* 活动图片 */}
        {activity.image && (
          <div className="bg-white/90 rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">活动图片</h2>
            <div className="flex justify-center">
              <img
                src={`http://localhost:3001${activity.image}`}
                alt="活动图片"
                className="max-w-full max-h-[500px] rounded-lg shadow-md object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* 参与者信息 */}
        <div className="bg-white/90 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-6">
            参与者 ({activity.registeredCount}/{activity.requiredPeople})
          </h2>
          {activity.registeredUsers && activity.registeredUsers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activity.registeredUsers.map((user, index) => (
                <div key={index} className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <img
                    src={participantAvatars[user.username] 
                      ? `http://localhost:3001/avatars${participantAvatars[user.username]}`
                      : `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-14 h-14 rounded-full mr-4 object-cover border"
                  />
                  <div>
                    <div className="font-medium text-blue-800 text-lg">{user.username}</div>
                    <div className="text-gray-600">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12 text-lg">
              暂无参与者
            </div>
          )}
        </div>

        {/* 评论区域 */}
        <Comments 
          activityId={id} 
          title="活动评论"
        />
      </div>
    </div>
  );
}
