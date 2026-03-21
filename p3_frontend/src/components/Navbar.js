import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [location]);

    const handleLogout = (e) => {
        e.stopPropagation();
        onLogout();
        navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">

                {/* LOGO */}
                <Link to="/" className="logo">
                    <img src="/logo.png" alt="MyImage Logo" className="logo-img" />
                </Link>

                {/* MENU */}
                <div className="nav-links">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Trang chủ</Link>
                    <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>Sản phẩm</Link>
                </div>

                {/* USER AREA */}
                <div className="nav-user">
                    {!user ? (
                        <>
                            <Link to="/auth/login" className="btn-login">Đăng nhập</Link>
                            <Link to="/auth/register" className="btn-register">Đăng ký</Link>
                        </>
                    ) : (
                        <div className="user-box" ref={dropdownRef} onClick={() => setOpen(!open)}>
                            <div className="avatar">
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="username">{user.username}</span>
                            <span className="chevron">{open ? '▲' : '▼'}</span>

                            {open && (
                                <div className="dropdown">
                                    <div className="dropdown-header">
                                        <div className="avatar avatar-lg">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="dropdown-name">{user.username}</p>
                                            <p className="dropdown-email">{user.email || 'Khách hàng'}</p>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <Link to="/profile" className="dropdown-item">
                                        <span>👤</span> Thông tin của tôi
                                    </Link>
                                    <Link to="/orders" className="dropdown-item">
                                        <span>🧾</span> Đơn hàng của tôi
                                    </Link>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <span>🚪</span> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Navbar;