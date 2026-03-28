import React from 'react';
import { NavLink } from 'react-router-dom';

import { Icon } from '@iconify/react';
import './Sidebar.css';

function Sidebar({ user, onLogout }) {
    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <Icon icon="mdi:view-dashboard" /> },
        { path: '/admin/products', label: 'Products', icon: <Icon icon="mdi:image-multiple" /> },
        { path: '/admin/prices', label: 'Prices', icon: <Icon icon="mdi:currency-usd" /> },
        { path: '/admin/order-page', label: 'Orders & Order Details', icon: <Icon icon="mdi:cart" /> },
        { path: '/admin/payment-transaction', label: 'VnPay Transactions', icon: <Icon icon="mdi:credit-card" /> },
        { path: '/admin/customers', label: 'Accounts', icon: <Icon icon="mdi:account-group" /> },
        { path: '/admin/photos', label: 'Photo Gallery', icon: <Icon icon="mdi:image" /> },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>MyImage Admin</h3>
                <p>Hello, <strong>{user?.username || 'Admin'}</strong></p>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                        >
                            <span className="icon-wrapper">{item.icon}</span>
                            <span className="label">{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={onLogout}>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}

export default Sidebar;