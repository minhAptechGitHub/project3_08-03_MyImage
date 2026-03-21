import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './AdminLayout.css';

function AdminLayout({ user, onLogout }) {
  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* MAIN */}
      <div className="admin-main">

        {/* HEADER */}
        <div className="admin-header">
          <Link to="/admin/dashboard" className="admin-logo-link">
            <img
              src="/logo.png"
              alt="MyImage Logo"
              className="admin-logo"
            />
          </Link>

          <div className="admin-user">
            <span>{user?.username}</span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminLayout;