import { lazy, use, useState } from 'react';
import apiService from '../Admin/Services';

const EMPTY = {
    f_name: '', l_name: '', email: '', username: '', password: '',
    dob: '', gender: '', p_no: '', address: ''
};

function Register({ onGoLogin }) {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const randomPass = () => {
        const chars = {
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
        };

        const pool = Object.entries(options)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => chars[key])
            .join("");

        if (!pool) return;

        return Array.from(12, () => pool[Math.floor(Math.random() * pool.length)]).join("");
    };
    const generateUsername = (firstName, lastName) => {
        const first = firstName.trim().split(" ");
        const last = lastName.trim().split(" ");

        const randomFirst = first[Math.floor(Math.random() * first.length)];
        const randomLast = last[Math.floor(Math.random() * last.length)];

        return (randomFirst + randomLast).toLowerCase();
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { f_name, l_name, email } = form;
        const username = generateUsername(f_name,l_name)
        const password = randomPass();

        if (!f_name || !l_name || !email || !username || !password) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        try {
            await apiService.customers.create({ ...form, isActive: true });
            onGoLogin({ success: 'Account created! You can now login as ' + username + ', mk:' + password });
        } catch {
            setError('Registration failed. Email or username may already be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-title">MyImage — Photo Print Shop</div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <h2 className="auth-heading">Register</h2>

                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-grid">
                        <div className="auth-field">
                            <label>First Name *</label>
                            <input type="text" name="f_name" value={form.f_name}
                                onChange={handleChange} placeholder="John" maxLength={50} />
                        </div>
                        <div className="auth-field">
                            <label>Last Name *</label>
                            <input type="text" name="l_name" value={form.l_name}
                                onChange={handleChange} placeholder="Doe" maxLength={50} />
                        </div>
                        <div className="auth-field">
                            <label>Email *</label>
                            <input type="email" name="email" value={form.email}
                                onChange={handleChange} placeholder="john@example.com" maxLength={100} />
                        </div>
                        <div className="auth-field">
                            <label>Username *</label>
                            <input type="text" name="username" value={form.username}
                                onChange={handleChange} placeholder="johndoe" maxLength={50} />
                        </div>
                        <div className="auth-field">
                            <label>Password *</label>
                            <input type="password" name="password" value={form.password}
                                onChange={handleChange} placeholder="Choose a password" />
                        </div>
                        <div className="auth-field">
                            <label>Date of Birth</label>
                            <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                        </div>
                        <div className="auth-field">
                            <label>Gender</label>
                            <select name="gender" value={form.gender} onChange={handleChange}>
                                <option value="">-- Select --</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <div className="auth-field">
                            <label>Phone</label>
                            <input type="tel" name="p_no" value={form.p_no}
                                onChange={handleChange} placeholder="+1 555 000 0000" maxLength={20} />
                        </div>
                        <div className="auth-field span-2">
                            <label>Address</label>
                            <textarea name="address" value={form.address}
                                onChange={handleChange} placeholder="Your address" rows={2} maxLength={255} />
                        </div>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Registering…' : 'Create Account'}
                    </button>

                    <p className="auth-hint">
                        Already have an account?{' '}
                        <span className="auth-link" onClick={() => onGoLogin()}>Login here</span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register