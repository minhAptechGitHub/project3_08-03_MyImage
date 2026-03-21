import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import './Auth.css';

function Register({ onGoLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fName: '', lName: '', email: '', pNo: '',
    dob: '', gender: '', address: '', username: '',
    password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validate = () => {
    if (!form.fName.trim() || !form.lName.trim()) return setError('Vui lòng nhập đầy đủ Họ và Tên.'), false;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Email không hợp lệ.'), false;
    if (!form.username.trim() || form.username.includes(' ')) return setError('Tên đăng nhập không hợp lệ.'), false;
    if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.'), false;
    if (form.password !== form.confirmPassword) return setError('Mật khẩu nhập lại không khớp.'), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...registerData } = form;
      await axiosClient.post('/customers', { ...registerData, isActive: true });
      navigate('/auth/login', { state: { success: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.' } });
    } catch (err) {
      setError(err.response?.data?.message || (err.response?.status === 409 ? 'Tài khoản đã tồn tại.' : 'Đăng ký thất bại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper register-wrapper">
      <div className="auth-card register-card">
        <div className="auth-brand">
          <img src="/logo.png" alt="MyImage" className="auth-logo" />
        </div>

        <h2 className="auth-title">Tạo tài khoản</h2>
        <p className="auth-subtitle">Điền thông tin để đăng ký</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-section-label">Thông tin cá nhân</div>
          <div className="auth-grid-2">
            <div className="auth-field">
              <label>Họ <span className="required">*</span></label>
              <input type="text" name="lName" value={form.lName} onChange={handleChange} placeholder="Nguyễn" />
            </div>
            <div className="auth-field">
              <label>Tên <span className="required">*</span></label>
              <input type="text" name="fName" value={form.fName} onChange={handleChange} placeholder="Văn An" />
            </div>
            <div className="auth-field">
              <label>Email <span className="required">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="example@gmail.com" />
            </div>
            <div className="auth-field">
              <label>Số điện thoại</label>
              <input type="tel" name="pNo" value={form.pNo} onChange={handleChange} placeholder="0912345678" />
            </div>
            <div className="auth-field">
              <label>Ngày sinh</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </div>
            <div className="auth-field">
              <label>Giới tính</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Chọn...</option>
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
              </select>
            </div>
            <div className="auth-field span-2">
              <label>Địa chỉ nhận hàng</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Số nhà, đường, phường/xã, quận/huyện, TP..." />
            </div>
          </div>

          <div className="auth-section-label">Thông tin đăng nhập</div>
          <div className="auth-grid-2">
            <div className="auth-field span-2">
              <label>Tên đăng nhập <span className="required">*</span></label>
              <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="vanan123" />
            </div>
            <div className="auth-field">
              <label>Mật khẩu <span className="required">*</span></label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label>Nhập lại mật khẩu <span className="required">*</span></label>
              <div className="input-with-icon">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Đăng ký'}
          </button>

          <p className="auth-footer-text">
            Đã có tài khoản?{' '}
            <span className="auth-link" onClick={() => navigate('/auth/login')}>Đăng nhập ngay</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;