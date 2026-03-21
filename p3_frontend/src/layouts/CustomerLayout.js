import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CustomerLayout.css';

function CustomerLayout({ user, onLogout }) {
  return (
    <div className="layout">

      <Navbar user={user} onLogout={onLogout} />

      <main className="layout-content">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}

export default CustomerLayout;