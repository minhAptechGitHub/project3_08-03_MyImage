import { useState } from "react";
import NewOrderForm from "./NewOrderForm";
import OrderList from "./OrderList";
import './ClientPage.css';

function ClientPage({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('photo'); // photo | order

    return (
        <div className="page-container">
            <div className="container">

                {/* ── Title Bar ── */}
                <div className="main-title-bar">
                    <h1 className="main-title">Photo Print Shop — Customer Panel</h1>
                    <div className="user-info">
                        <span>{user.username} (Customer)</span>
                        <button className="btn-logout" onClick={onLogout}>Logout</button>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'photo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('photo')}
                    >
                        New Order
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'order' ? 'active' : ''}`}
                        onClick={() => setActiveTab('order')}
                    >
                        My Orders
                    </button>
                </div>

                {/* ── Tab Content ── */}
                <div className="content-container">
                    {activeTab === 'photo' && <NewOrderForm user={user} />}
                    {activeTab === 'order' && <OrderList user={user} />}
                </div>

            </div>
        </div>
    );
}

export default ClientPage;