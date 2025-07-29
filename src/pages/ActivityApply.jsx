import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ActivityApply() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    type: '',
    location: '',
    startTime: '',
    duration: '',
    requiredPeople: '',
    pricePerPerson: '',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const username = localStorage.getItem('username') || '';
    const email = localStorage.getItem('email') || '';
    if (!form.title || !form.type || !form.location || !form.startTime || !form.duration || !form.requiredPeople) {
      setError('请填写所有必填项');
      return;
    }
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('username', username);
      formData.append('email', email);
      if (image) {
        formData.append('image', image);
      }
      const res = await fetch('http://192.168.56.1:3001:3001/api/activities/apply', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.status === 201) {
        setSuccess('活动申报成功！');
        setTimeout(() => navigate('/nav'), 1000);
      } else {
        setError(data.message || '申报失败');
      }
    } catch {
      setError('网络错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <form className="bg-white/90 p-8 rounded-xl shadow-md w-full max-w-md space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">申报新活动</h2>
        <input className="w-full px-3 py-2 border rounded focus:outline-none" name="title" placeholder="活动名称" value={form.title} onChange={handleChange} />
        <input className="w-full px-3 py-2 border rounded focus:outline-none" name="type" placeholder="运动类型" value={form.type} onChange={handleChange} />
        <input className="w-full px-3 py-2 border rounded focus:outline-none" name="location" placeholder="运动场地" value={form.location} onChange={handleChange} />
        
        {/* 活动描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">活动描述</label>
          <textarea 
            className="w-full px-3 py-2 border rounded focus:outline-none resize-none" 
            name="description" 
            placeholder="请详细描述活动内容、注意事项等..."
            value={form.description} 
            onChange={handleChange}
            rows="4"
            maxLength="500"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {form.description.length}/500
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
          <input className="w-full px-3 py-2 border rounded focus:outline-none" name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} />
        </div>
        <select className="w-full px-3 py-2 border rounded focus:outline-none" name="duration" value={form.duration} onChange={handleChange}>
          <option value="">持续时间</option>
          <option value="30分钟">30分钟</option>
          <option value="1小时">1小时</option>
          <option value="1.5小时">1.5小时</option>
          <option value="2小时">2小时</option>
          <option value="2.5小时">2.5小时</option>
          <option value="3小时">3小时</option>
          <option value="4小时">4小时</option>
          <option value="半天">半天</option>
          <option value="全天">全天</option>
        </select>
        <input className="w-full px-3 py-2 border rounded focus:outline-none" name="requiredPeople" type="number" min="1" placeholder="所需人数" value={form.requiredPeople} onChange={handleChange} />
        <input className="w-full px-3 py-2 border rounded focus:outline-none" name="pricePerPerson" type="number" min="0" placeholder="人均价格" value={form.pricePerPerson} onChange={handleChange} />
        
        {/* 图片上传区域 */}
        <div>
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
              <span>{image ? image.name : '活动图片'}</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden"
              />
            </label>
            {image && (
              <button
                type="button"
                onClick={() => setImage(null)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                移除
              </button>
            )}
          </div>
          {image && (
            <div className="mt-2 text-sm text-gray-600">
              已选择: {image.name}
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button type="submit" className="w-full py-2 bg-blue-700 text-white rounded hover:bg-blue-900">提交申报</button>
        <button type="button" className="w-full py-2 mt-2 bg-gray-200 text-blue-700 rounded" onClick={() => navigate('/nav')}>返回</button>
      </form>
    </div>
  );
} 