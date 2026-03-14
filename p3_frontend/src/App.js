import React, { useState } from 'react';
import './App.css';
import AdminPage from './Admin/AdminPage';
import Login from './login/Login';
import Register from './login/Register';
import ClientPage from './Client/ClientPage';

function App() {
  const [page, setPage] = useState('login');   // 'login' | 'register' | 'admin' | 'customer'
  const [user, setUser] = useState(null);
  const [notify, setNotify] = useState(null);     

  const showNotify = (type, msg) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 12000);
  };

  // Called by LoginForm on success
  const handleLoginSuccess = (loggedInUser, role) => {
    setUser(loggedInUser);
    if (role === 'Admin') setPage('admin');
    if (role === 'Customer') setPage('customer');
  };

  const handleGoLogin = (opts) => {
    if (opts?.success) showNotify('success', opts.success);
    setPage('login');
  };

  const handleLogout = () => {
    setUser(null);
    setPage('login');
    showNotify('success', 'You have been logged out.');
  };

  return (
    <>
      {/* ── Global notification toast ── */}
      {notify && (
        <div className={`toast toast-${notify.type}`}>
          {notify.msg}
          <button className="toast-close" onClick={() => setNotify(null)}>×</button>
        </div>
      )}

      {page === 'admin' && user && (
        <AdminPage user={user} onLogout={handleLogout} />
      )}
      {page === 'customer' && user && (
        <ClientPage user={user} onLogout={handleLogout} />
      )}

      {page === 'login' && (
        <Login
          onSuccess={handleLoginSuccess}
          onGoRegister={() => setPage('register')}
        />
      )}

      {page === 'register' && (
        <Register onGoLogin={handleGoLogin} />
      )}
    </>
  );
}

export default App;
