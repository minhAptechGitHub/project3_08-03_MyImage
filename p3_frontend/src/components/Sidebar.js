import React from 'react';
import { NavLink } from 'react-router-dom';

import {
    DashboardOutlined,
    PictureOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    CreditCardOutlined,
    TeamOutlined,
    FileImageOutlined,
    UsergroupAddOutlined,
} from '@ant-design/icons';
import './Sidebar.css';

function Sidebar({ user, onLogout }) {
    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
        { path: '/admin/products', label: 'Products', icon: <PictureOutlined /> },
        { path: '/admin/prices', label: 'Prices', icon: <DollarOutlined /> },
        { path: '/admin/order-page', label: 'Orders & Order Details', icon: <ShoppingCartOutlined /> },
        { path: '/admin/payments', label: 'Payment Method', icon: <CreditCardOutlined /> },
        { path: '/admin/customers', label: 'Accounts', icon: <TeamOutlined /> },
        { path: '/admin/photos', label: 'Photo Gallery', icon: <FileImageOutlined /> },
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