import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

import Dashboard from './pages/admin/Dashboard';
import OrderPage from './pages/admin/OrderPage';
import ProductPage from './pages/admin/ProductPage';
import PricePage from './pages/admin/PricePage';
import CustomerPage from './pages/admin/CustomerPage';
import PhotoPage from './pages/admin/PhotoPage';

import Home from './pages/customer/Home';
import ProductDetail from './pages/customer/ProductDetail';
import OrderNew from './pages/customer/OrderNew';
import MyOrders from './pages/customer/MyOrders';
import CustomOrder from './pages/customer/CustomOrder';
import Profile from './pages/customer/ProfileCustomer';

import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('user');
      if (!stored) return;

      const userData = JSON.parse(stored);
      const token = userData?.token;

      // Kiểm tra token hết hạn
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem('user');
          setUser(null);
          return;
        }
      }

      setUser(userData);
    } catch (err) {
      console.error("Lỗi parse user:", err);
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogin = (userData, role, token) => {
    const fullUser = { ...userData, role, token };
    sessionStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Routes>

        {/* 🔐 AUTH */}
        <Route element={<AuthLayout />}>
          <Route
            path="/auth/login"
            element={
              user
                ? (
                  user.role?.toLowerCase() === "admin"
                    ? <Navigate to="/admin/dashboard" replace />
                    : <Navigate to="/" replace />
                )
                : (
                  <Login
                    onSuccess={(userData, role, token) => {
                      handleLogin(userData, role, token);
                      if (role.toLowerCase() === "admin") {
                        window.location.href = "/admin/dashboard";
                      } else {
                        window.location.href = "/";
                      }
                    }}
                    onGoRegister={() => window.location.href = '/auth/register'}
                  />
                )
            }
          />
          
          <Route
            path="/auth/admin-login"
            element={
              user
                ? (
                  user.role?.toLowerCase() === "admin"
                    ? <Navigate to="/admin/dashboard" replace />
                    : <Navigate to="/" replace />
                )
                : <AdminLogin
                    onSuccess={(userData, role, token) => {
                      handleLogin(userData, role, token);
                      window.location.href = "/admin/dashboard";
                    }}
                  />
            }
          />

          <Route
            path="/auth/register"
            element={
              user
                ? <Navigate to="/" replace />
                : <Register />
            }
          />
        </Route>

        {/* 🔥 ADMIN */}
        <Route
          path="/admin/*"
          element={
            user && user.role?.toLowerCase() === "admin"
              ? <AdminLayout user={user} onLogout={handleLogout} />
              : <Navigate to="/auth/login" replace />
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="order-page" element={<OrderPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="prices" element={<PricePage />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="photos" element={<PhotoPage />} />

          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* 🏠 CUSTOMER */}
        <Route
          path="/*"
          element={
            user?.role?.toLowerCase() === "admin"
              ? <Navigate to="/admin/dashboard" replace />
              : <CustomerLayout user={user} onLogout={handleLogout} />
          }
        >
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="order/new" element={<OrderNew />} />
          <Route path="order/custom" element={<CustomOrder />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 🚫 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;