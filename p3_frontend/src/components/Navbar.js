import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './Navbar.css';

const CATEGORIES = [
  { value: 'anh-de-ban', label: 'Ảnh để bàn'  },
  { value: 'khung-anh',  label: 'Khung ảnh'    },
  { value: 'anh-cong-cuoi', label: 'Ảnh cổng cưới' },
  { value: 'in-anh',     label: 'In ảnh'        },
];

function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileOpen(false);
  }, [location]);

  const handleLogout = (e) => {
    e.stopPropagation();
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isCat = (cat) => location.pathname.startsWith(`/danh-muc/${cat}`) ? 'active' : '';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="logo">
          <img src="/logo.png" alt="MyImage Logo" className="logo-img" />
        </Link>

        {/* MENU DESKTOP */}
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Trang chủ</Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.value}
              to={`/danh-muc/${cat.value}`}
              className={isCat(cat.value)}
            >
              {cat.label}
            </Link>
          ))}
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
              <div className="avatar">{user.username?.charAt(0).toUpperCase()}</div>
              <span className="username">{user.username}</span>
              <span className="chevron">{open ? '▲' : '▼'}</span>

              {open && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <div className="avatar avatar-lg">{user.username?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="dropdown-name">{user.username}</p>
                      <p className="dropdown-email">{user.email || 'Khách hàng'}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item">
                    <Icon icon="noto:bust-in-silhouette" width="18" /> Thông tin của tôi
                  </Link>
                  <Link to="/orders" className="dropdown-item">
                    <Icon icon="noto:receipt" width="18" /> Đơn hàng của tôi
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <Icon icon="noto:door" width="18" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link">Trang chủ</Link>
          {CATEGORIES.map(cat => (
            <Link
              key={cat.value}
              to={`/danh-muc/${cat.value}`}
              className="mobile-link"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;