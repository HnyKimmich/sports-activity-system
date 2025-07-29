import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { register, login } from '../api/auth';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || (isRegister && !email)) {
      setError(isRegister ? '请填写所有信息' : '请输入用户名和密码');
      return;
    }
    setError('');
    try {
      if (isRegister) {
        // 注册逻辑
        const { status, data } = await register({ username, password, email });
        if (status === 409) {
          setError(data.message || '该邮箱已被注册');
          return;
        }
        if (status === 201 && data.code === 201) {
          localStorage.setItem('username', username);
          localStorage.setItem('email', email);
          setIsRegister(false);
          setError('注册成功，请登录');
          setEmail('');
        } else {
          setError(data.message || '注册失败');
        }
      } else {
        // 登录逻辑
        const { status, data } = await login({ username, password });
        if (status === 404) {
          setError(data.message || '该用户不存在');
          return;
        }
        if (status === 401) {
          setError(data.message || '密码错误');
          return;
        }
        if (status === 200 && data.code === 200) {
          localStorage.setItem('username', username); // 保存用户名
          if (data.data && data.data.email) {
            localStorage.setItem('email', data.data.email);
          } else {
            localStorage.removeItem('email');
          }
          navigate('/nav');
        } else {
          setError(data.message || '登录失败');
        }
      }
    } catch (err) {
      console.error(err);
      setError(isRegister ? '注册请求失败' : '登录请求失败');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="w-full max-w-md p-8 bg-white/80 rounded-2xl shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center mb-6">
          <svg className="w-16 h-16 text-blue-600 mb-2 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25v-1.5A2.25 2.25 0 016.75 16.5h10.5a2.25 2.25 0 012.25 2.25v1.5" /></svg>
          <h2 className="text-3xl font-extrabold text-blue-800 tracking-tight">{isRegister ? '用户注册' : '用户登录'}</h2>
        </div>
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-1 text-blue-800 font-medium">用户名</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 placeholder-blue-300 transition-shadow shadow-sm focus:shadow-lg"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-1 text-blue-800 font-medium">密码</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 placeholder-blue-300 transition-shadow shadow-sm focus:shadow-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
          {isRegister && (
            <div className="mb-8">
              <label className="block mb-1 text-blue-800 font-medium">邮箱</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 placeholder-blue-300 transition-shadow shadow-sm focus:shadow-lg"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="请输入邮箱"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-900 transition-all duration-200"
          >
            {isRegister ? '注册' : '登录'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-blue-700 hover:underline text-sm"
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </div>
      </div>
    </div>
  );
} 