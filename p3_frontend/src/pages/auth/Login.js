import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import userService from '../../services/userService';
import './Auth.css';

function Login({ onSuccess, showNotify }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      showNotify?.('error', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const payload = { username: form.username, password: form.password };
      const res = await userService.login(payload);

      if (!res?.user) {
        showNotify?.('error', 'Tên đăng nhập hoặc mật khẩu không đúng.');
        return;
      }

      if (res.user.isActive === false || res.user.IsActive === false) {
        showNotify?.('error', 'Tài khoản này đã bị khóa.');
        return;
      }

      const userData = res.user;
      const token = res.token || res.accessToken;
      const role = 'Customer';

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      showNotify?.('success', 'Đăng nhập Customer thành công!');
      onSuccess(userData, role, token);
      navigate('/');
    } catch (err) {
      showNotify?.('error', err.response?.data?.message || 'Lỗi kết nối server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/logo.png" alt="MyImage" className="auth-logo" />
        </div>

        <h2 className="auth-title">Chào mừng trở lại!</h2>
        <p className="auth-subtitle">Đăng nhập để tiếp tục</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Đăng nhập'}
          </button>

          <p className="auth-footer-text">
            Chưa có tài khoản?{' '}
            <span className="auth-link" onClick={() => navigate('/auth/register')}>Đăng ký ngay</span>
          </p>

          <p className="auth-footer-text">
            Bạn là quản trị viên?{' '}
            <span className="auth-link" onClick={() => navigate('/auth/admin-login')}>Đăng nhập Admin</span>
          </p>
          
          <p className="auth-footer-text back-home-text">
            <span className="auth-link" onClick={() => navigate('/')}>
              ← Quay lại trang chủ
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;