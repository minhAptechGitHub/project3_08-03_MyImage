import { useState } from 'react';
import apiService from '../Admin/Services';

function Login({ onSuccess, onGoRegister }) {
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) {
            setError('Please enter both Username and Password.');
            return;
        }
        setLoading(true);
        try {
            // Try customer login first
            const customer = await apiService.customers.login(form);
            if (customer) {
                if (!customer.isActive) {
                    setError('This account is inactive. Please contact support.');
                    return;
                }
                onSuccess(customer, 'Customer'); // ✅ pass role directly
                return;
            }

            // Fall back to admin login
            const admin = await apiService.admins.login(form);
            if (admin) {
                onSuccess(admin, 'Admin'); // ✅ pass role directly
                return;
            }

            setError('Invalid username or password.');
        } catch {
            setError('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-title">MyImage — Photo Print Shop</div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2 className="auth-heading">Login</h2>

                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-field">
                        <label>Username</label>
                        <input type="text" name="username" value={form.username}
                            onChange={handleChange} placeholder="Your username" />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password}
                            onChange={handleChange} placeholder="Your password" />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Logging in…' : 'Login'}
                    </button>

                    <p className="auth-hint">
                        No account?{' '}
                        <span className="auth-link" onClick={onGoRegister}>Register here</span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login