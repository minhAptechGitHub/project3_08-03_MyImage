import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import userService from '../../services/userService';
import './Auth.css';

function Login({ onSuccess, onGoRegister }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.success || '');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      let userData = null, role = '', token = '';
      const payload = { username: form.username, password: form.password };

      try {
        const res = await userService.login(payload);
        if (res?.user) {
          if (res.user.isActive === false || res.user.IsActive === false) {
            setError('Tài khoản này đã bị khóa.');
            return;
          }
          userData = res.user;
          token = res.token || res.accessToken;
          role = 'Customer';
        }
      } catch {}

      if (!userData) {
        const res = await adminService.login(payload);
        if (res?.user) {
          userData = res.user;
          token = res.token || res.accessToken;
          role = 'Admin';
        }
      }

      if (!userData) { setError('Tên đăng nhập hoặc mật khẩu không đúng.'); return; }

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      onSuccess(userData, role, token);
      navigate(role === 'Admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối server. Vui lòng thử lại.');
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
          {successMsg && <div className="auth-success">{successMsg}</div>}
          {error && <div className="auth-error">{error}</div>}

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
        </form>
      </div>
    </div>
  );
}

export default Login;