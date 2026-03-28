import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import '../../styles/admin/Dashboard.css';

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', cls: 'pending' },
  'payment-verified': { label: 'Đã xác nhận TT', cls: 'payment-verified' },
  processing: { label: 'Đang xử lý', cls: 'processing' },
  printed: { label: 'Đã in', cls: 'printed' },
  shipped: { label: 'Đang giao', cls: 'shipped' },
  completed: { label: 'Hoàn thành', cls: 'completed' },
  done: { label: 'Hoàn thành', cls: 'completed' },
  cancelled: { label: 'Đã hủy', cls: 'cancelled' },
  canceled: { label: 'Đã hủy', cls: 'cancelled' },
};

function getStatusInfo(status = '') {
  return STATUS_MAP[status.toLowerCase()] || { label: status, cls: 'pending' };
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0, totalCustomers: 0, totalRevenue: 0, pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [orders, customers] = await Promise.all([
        adminService.getAllOrders().catch(() => []),
        adminService.getAllCustomers().catch(() => []),
      ]);

      const totalRevenue = (orders || []).reduce((s, o) => s + (o.totalPrice || 0), 0);
      const pendingOrders = (orders || []).filter(o => o.status === 'Pending').length;

      setStats({
        totalOrders: (orders || []).length,
        totalCustomers: (customers || []).length,
        totalRevenue,
        pendingOrders,
      });

      setRecentOrders(
        [...(orders || [])]
          .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
          .slice(0, 5)
      );
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const vnd = v => {
    if (!v) return '0 ₫';
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1).replace('.0', '') + ' tỷ ₫';
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1).replace('.0', '') + ' tr ₫';
    if (v >= 1_000) return Math.round(v / 1_000) + 'k ₫';
    return v + ' ₫';
  };

  const CARDS = [
    { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: <Icon icon="noto:package" width="28" />, cls: 'card-blue', isStr: false },
    { label: 'Doanh thu', value: vnd(stats.totalRevenue), icon: <Icon icon="noto:money-bag" width="28" />, cls: 'card-green', isStr: true },
    { label: 'Đơn chờ xử lý', value: stats.pendingOrders, icon: <Icon icon="noto:hourglass-not-done" width="28" />, cls: 'card-orange', isStr: false },
    { label: 'Khách hàng', value: stats.totalCustomers, icon: <Icon icon="noto:busts-in-silhouette" width="28" />, cls: 'card-purple', isStr: false },
  ];

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Đang tải thống kê...</p>
    </div>
  );

  return (
    <div className="dashboard-container">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Bảng điều khiển</h2>
          <p className="page-subtitle">Tổng quan hoạt động hôm nay</p>
        </div>
        <button
          className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          ↻ {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        {CARDS.map(c => (
          <div className={`stat-card ${c.cls}`} key={c.label}>
            <div className="stat-icon-wrap">{c.icon}</div>
            <div className="stat-body">
              <div className="stat-value">
                {c.isStr ? c.value : c.value.toLocaleString('vi-VN')}
              </div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Đơn hàng mới nhất</h3>
          <Link to="/admin/order-page" className="view-all-btn">
            Xem tất cả →
          </Link>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.map(order => {
                const { label, cls } = getStatusInfo(order.status);
                return (
                  <tr key={order.orderId}>
                    <td><span className="order-id">#ORD-{String(order.orderId || 0).padStart(4, '0')}</span></td>
                    <td>Khách #{order.custId}</td>
                    <td>{new Date(order.orderDate || Date.now()).toLocaleDateString('vi-VN')}</td>
                    <td><strong className="money">{vnd(order.totalPrice)}</strong></td>
                    <td><span className={`status-badge ${cls}`}>{label}</span></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="no-data">Chưa có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;