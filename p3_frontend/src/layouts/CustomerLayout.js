import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './CustomerLayout.css';

function CustomerLayout({ user, onLogout, showNotify }) {
  return (
    <div className="layout">

      <Navbar user={user} onLogout={onLogout} />

      <main className="layout-content">
        <Outlet context={{ showNotify }}/>
      </main>

      <Footer />

    </div>
  );
}

export default CustomerLayout;