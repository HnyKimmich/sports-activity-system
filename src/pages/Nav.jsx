import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Nav() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [search, setSearch] = useState('');
  const [activities, setActivities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const uname = localStorage.getItem('username') || '用户';
    setUsername(uname);
    // 获取当前用户头像
    fetch(`http://192.168.56.1:3001/api/users/profile?username=${encodeURIComponent(uname)}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200 && data.data.avatar) {
          setAvatar(data.data.avatar);
        } else {
          setAvatar('');
        }
      });
    fetch('http://192.168.56.1:3001/api/activities')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setActivities(data.data);
          setFiltered(data.data);
        }
      });
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(activities);
    } else {
      setFiltered(
        activities.filter(act =>
          act.title.includes(search) || act.type?.includes(search) || act.location?.includes(search)
        )
      );
    }
  }, [search, activities]);

  const handleRegister = async (act) => {
    setMsg('');
    const now = Date.now();
    if (new Date(act.startTime).getTime() - now < 24 * 60 * 60 * 1000) {
      setMsg('距离活动开始不足24小时，无法报名');
      return;
    }
    const username = localStorage.getItem('username') || '';
    const email = localStorage.getItem('email') || '';
    try {
      const res = await fetch('http://192.168.56.1:3001/api/activities/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: act.id, username })
      });
      const data = await res.json();
      if (res.status === 200) {
        setMsg('报名成功！');
        // 刷新活动数据
        fetch('http://192.168.56.1:3001/api/activities')
          .then(res => res.json())
          .then(data => {
            if (data.code === 200) {
              setActivities(data.data);
              setFiltered(data.data);
            }
          });
      } else {
        setMsg(data.message || '报名失败');
      }
    } catch (err) {
      setMsg('网络错误');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="flex items-center justify-between px-8 py-6 bg-white/80 shadow-md rounded-b-2xl">
        <div className="text-xl font-bold text-blue-800">
          你好，{username}
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-800 transition-all"
            onClick={() => navigate('/my-activities')}
          >
            我的活动
          </button>
          <button
            className="px-4 py-2 bg-blue-700 text-white rounded-lg shadow hover:bg-blue-900 transition-all"
            onClick={() => navigate('/apply')}
          >
            申报活动
          </button>
          <button
            className="p-0 bg-transparent border-none shadow-none hover:bg-transparent"
            onClick={() => navigate('/profile')}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <img
              src={avatar
                ? 'http://192.168.56.1:3001/avatars' + avatar
                : 'https://api.dicebear.com/7.x/bottts/svg?seed=' + username}
              alt="头像"
              className="w-10 h-10 rounded-full border object-cover"
            />
          </button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto mt-8">
        <input
          type="text"
          className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 placeholder-blue-300 mb-6 shadow-sm"
          placeholder="搜索活动标题、类型或场地..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {msg && <div className="text-center text-red-500 mb-2">{msg}</div>}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center text-blue-400">暂无相关活动</div>
          ) : (
            filtered.map(act => {
              const isRegistered = act.registeredUsers?.some(u => u.username === username);
              return (
                <div key={act.id} className="p-5 bg-white/90 rounded-xl shadow flex flex-col gap-1">
                  <div className="text-lg font-semibold text-blue-800">{act.title}</div>
                  <div className="text-blue-600 text-sm">开始时间：{new Date(act.startTime).toLocaleString('zh-CN')}</div>
                  <div className="text-blue-600 text-sm">持续时间：{act.duration || '未设置'}</div>
                  <div className="text-blue-600 text-sm">地点：{act.location}</div>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      className="text-blue-500 hover:underline text-sm font-bold"
                      onClick={() => navigate(`/activity/${act.id}`)}
                    >
                      查看详情
                    </button>
                    <button
                      className="text-blue-500 hover:underline disabled:text-gray-400"
                      onClick={() => handleRegister(act)}
                      disabled={isRegistered || new Date(act.startTime).getTime() - Date.now() < 24 * 60 * 60 * 1000 || act.registeredCount >= act.requiredPeople}
                    >
                      {isRegistered
                        ? '已报名'
                        : (new Date(act.startTime).getTime() - Date.now() < 24 * 60 * 60 * 1000
                          ? '报名已截止'
                          : (act.registeredCount >= act.requiredPeople ? '人数已满' : '报名'))}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}