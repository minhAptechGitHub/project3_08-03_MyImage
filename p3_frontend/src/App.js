import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';

import AdminLogin from './pages/auth/AdminLogin';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/admin/Dashboard';
import OrderPage from './pages/admin/OrderPage';
import ProductPage from './pages/admin/ProductPage';
import PricePage from './pages/admin/PricePage';
import CustomerPage from './pages/admin/CustomerPage';
import PhotoPage from './pages/admin/PhotoPage';
import PaymentTransactionPage from './pages/admin/PaymentTransactionPage';

import Home from './pages/customer/Home';
import ProductDetail from './pages/customer/ProductDetail';
import OrderNew from './pages/customer/OrderNew';
import MyOrders from './pages/customer/MyOrders';
import CustomOrder from './pages/customer/CustomOrder';
import Profile from './pages/customer/ProfileCustomer';
import VnPayCallback from './pages/customer/VnPayCallback';
import CategoryPage from './pages/customer/CategoryPage';

import './App.css';

// Debounce để tránh toast hiện 2 lần do React StrictMode
let _lastAuthToast = 0;

// Bảo vệ route — hiện toast rồi redirect nếu chưa đăng nhập
function ProtectedRoute({ user, showNotify, children }) {
  useEffect(() => {
    if (!user) {
      const now = Date.now();
      if (now - _lastAuthToast > 1000) {
        _lastAuthToast = now;
        showNotify?.('info', 'Vui lòng đăng nhập hoặc đăng ký tài khoản để đặt in');
      }
    }
  }, []);

  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [notifies, setNotifies] = useState([]);

  const showNotify = (type, msg) => {
    const id = Date.now();
    setNotifies(prev => [...prev, { id, type, msg }]);
    setTimeout(() => setNotifies(prev => prev.filter(n => n.id !== id)), 3000);
  };

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
          sessionStorage.removeItem('user');
          setUser(null);
          return;
        }
      }

      setUser(userData);
      setNotifies([]);
    } catch (err) {
      console.error("Lỗi parse user:", err);
      sessionStorage.removeItem('user');
      showNotify?.('error', 'Lỗi parse user');
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
    showNotify?.('success', 'Bạn đã Logged out');
  };

  return (
    <Router>
      {notifies.length > 0 && (
        <div className="toast-container">
          {notifies.map((n) => (
            <div key={n.id} className={`toast toast-${n.type}`}>
              {n.msg}
              <button className="toast-close" onClick={() => setNotifies(prev => prev.filter(x => x.id !== n.id))}>×</button>
            </div>
          ))}
        </div>
      )}

      <Routes>

        {/* 🔐 AUTH */}
        <Route element={<AuthLayout />}>
          <Route
            path="/auth/login"
            element={
              user
                ? <Navigate to="/" replace />
                : <Login onSuccess={handleLogin} showNotify={showNotify} />
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
                  showNotify={showNotify}
                />
            }
          />
          <Route
            path="/auth/register"
            element={
              user
                ? <Navigate to="/" replace />
                : <Register showNotify={showNotify} />
            }
          />
        </Route>

        {/* 🔥 ADMIN */}
        <Route
          path="/admin/*"
          element={
            user && user.role?.toLowerCase() === "admin"
              ? <AdminLayout user={user} onLogout={handleLogout} showNotify={showNotify} />
              : <Navigate to="/auth/login" replace />
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="order-page" element={<OrderPage />} />
          <Route path="products" element={<ProductPage />} />
          <Route path="prices" element={<PricePage />} />
          <Route path="payment-transaction" element={<PaymentTransactionPage />} />
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
              : <CustomerLayout user={user} onLogout={handleLogout} showNotify={showNotify} />
          }
        >
          {/* Route công khai */}
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="VnPay/callback" element={<VnPayCallback />} />
          <Route path="danh-muc/:category" element={<CategoryPage />} />

          {/* Route yêu cầu đăng nhập */}
          <Route
            path="order/new"
            element={
              <ProtectedRoute user={user} showNotify={showNotify}>
                <OrderNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="order/custom"
            element={
              <ProtectedRoute user={user} showNotify={showNotify}>
                <CustomOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute user={user} showNotify={showNotify}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute user={user} showNotify={showNotify}>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 🚫 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;