import { lazy, use, useState } from 'react';
import apiService from '../Admin/Services';

const EMPTY = {
    FName: '', LName: '', email: '', username: '', password: '',
    dob: '', gender: '', pNo: '', address: ''
};

function Register({ onGoLogin }) {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
    });

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

        return Array.from({length: 12 }, () => pool[Math.floor(Math.random() * pool.length)]).join("");
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
        const { FName, LName, email } = form;
        form.username = generateUsername(FName, LName)
        form.password = randomPass();

        if (!FName || !LName || !email || !form.username || !form.password) {
            setError('Please fill in all required fields.');
            return;
        }
        setLoading(true);
        try {
            console.log(form)
            await apiService.customers.create({ ...form, isActive: true });
            onGoLogin({ success: 'Account created! You can now login as ' + form.username + ', mk:' + form.password });
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
                            <input type="text" name="FName" value={form.FName}
                                onChange={handleChange} placeholder="John" maxLength={50} />
                        </div>
                        <div className="auth-field">
                            <label>Last Name *</label>
                            <input type="text" name="LName" value={form.LName}
                                onChange={handleChange} placeholder="Doe" maxLength={50} />
                        </div>
                        <div className="auth-field">
                            <label>Email *</label>
                            <input type="email" name="email" value={form.email}
                                onChange={handleChange} placeholder="john@example.com" maxLength={100} />
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
                            </select>
                        </div>
                        <div className="auth-field">
                            <label>Phone</label>
                            <input type="tel" name="pNo" value={form.pNo}
                                onChange={handleChange} placeholder="0912345678" maxLength={20} />
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