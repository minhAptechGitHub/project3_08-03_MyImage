import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import adminService from '../../services/adminService';
import './Auth.css';

function AdminLogin({ onSuccess, showNotify }) {
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
            const res = await adminService.login(payload);

            if (!res?.user) {
                showNotify?.('error', 'Tên đăng nhập hoặc mật khẩu không đúng.');
                return;
            }

            const userData = res.user;
            const token = res.token || res.accessToken;
            const role = 'Admin';

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            showNotify?.('success', 'Đăng nhập Admin thành công!');
            onSuccess(userData, role, token);
            navigate('/admin/dashboard');
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

                <h2 className="auth-title">Quản trị viên</h2>
                <p className="auth-subtitle">Đăng nhập trang quản trị</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Nhập tên đăng nhập admin"
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
                        Bạn là khách hàng?{' '}
                        <span className="auth-link" onClick={() => navigate('/auth/login')}>Đăng nhập tại đây</span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;