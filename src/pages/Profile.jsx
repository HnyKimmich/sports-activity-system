import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export default function Profile() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || '';
  const [profile, setProfile] = useState({ gender: '', age: '', sport: '', signature: '', avatar: '', email: '' });
  // 直接进入编辑模式
  const [msg, setMsg] = useState('');
  const profileRef = useRef(profile);

  useEffect(() => {
    if (!username) return;
    fetch(`http://192.168.56.1:3001/api/users/profile?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) setProfile(data.data);
      });
    // 不要 return 自动保存
  }, [username]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 头像上传
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('username', username);
    const res = await fetch('http://192.168.56.1:3001/api/users/avatar', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.code === 200) {
      setProfile({ ...profile, avatar: data.path });
      setMsg('头像上传成功，请点击保存按钮保存到个人信息');
    } else {
      setMsg(data.message || '头像上传失败');
    }
  };

  const handleBack = async () => {
    await fetch('http://192.168.56.1:3001/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, ...profile })
    });
    navigate('/nav');
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="bg-white/90 p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center tracking-wide">个人信息</h2>
        <div className="flex flex-col items-center mb-4">
          <img
            src={profile.avatar ? ('http://192.168.56.1:3001/avatars' + profile.avatar) : ('https://api.dicebear.com/7.x/bottts/svg?seed=' + username)}
            alt="头像"
            className="w-24 h-24 rounded-full border mb-2 object-cover"
          />
          <label className="w-full flex flex-col items-center cursor-pointer">
            <span className="text-sm text-blue-700 mb-1">从本地上传头像</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="space-y-4">
          <div>用户名：{username}</div>
          <div className="flex items-center gap-4">
            <span>性别：</span>
            <div className="flex gap-6 items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="男"
                  checked={profile.gender === '男'}
                  onChange={handleChange}
                  className="accent-blue-600 w-5 h-5 mr-1"
                />
                男
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="女"
                  checked={profile.gender === '女'}
                  onChange={handleChange}
                  className="accent-pink-500 w-5 h-5 mr-1"
                />
                女
              </label>
            </div>
          </div>
          <div>
            年龄：<input name="age" type="number" min="0" className="border rounded px-2 py-1 w-20" value={profile.age} onChange={handleChange} />
          </div>
          <div>
            运动领域：<input name="sport" className="border rounded px-2 py-1" value={profile.sport} onChange={handleChange} />
          </div>
          <div>
            个性签名：<input name="signature" className="border rounded px-2 py-1 w-full" value={profile.signature} onChange={handleChange} />
          </div>
        </div>
        {msg && <div className="text-center text-green-600 text-sm mt-2">{msg}</div>}
        <div className="flex gap-2 mt-4">
          {/* 编辑按钮已移除 */}
          <button
            className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-700"
            onClick={handleLogout}
          >
            退出登录
          </button>
        </div>
        <button
          className="w-full py-2 mt-2 bg-gray-200 text-blue-700 rounded"
          onClick={handleBack}
        >
          返回
        </button>
      </div>
    </div>
  );
} 