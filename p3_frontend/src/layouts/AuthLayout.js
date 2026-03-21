import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-bg" />
      <Outlet />
    </div>
  );
}

export default AuthLayout;