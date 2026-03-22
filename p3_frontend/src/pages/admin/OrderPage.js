import React, { useCallback, useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import ActionButtons from '../../components/ActionButton';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';
import '../../styles/admin/OrderPage.css';

import { useOutletContext } from 'react-router-dom';

const STATUSES = ['Pending', 'Payment Verified', 'Processing', 'Printed', 'Shipped', 'Completed', 'Cancelled'];

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', cls: 'pending' },
  'payment verified': { label: 'Đã xác nhận TT', cls: 'payment-verified' },
  processing: { label: 'Đang xử lý', cls: 'processing' },
  printed: { label: 'Đã in', cls: 'printed' },
  shipped: { label: 'Đang giao', cls: 'shipped' },
  completed: { label: 'Hoàn thành', cls: 'completed' },
  cancelled: { label: 'Đã hủy', cls: 'cancelled' },
};

function getStatusInfo(status = '') {
  return STATUS_MAP[status.toLowerCase()] || { label: status, cls: 'pending' };
}

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewOrder, setViewOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { showNotify } = useOutletContext();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [o, c] = await Promise.all([
        adminService.getAllOrders().catch(() => []),
        adminService.getAllCustomers().catch(() => []),
      ]);
      setOrders(Array.isArray(o) ? o.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) : []);
      setCustomers(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getCustomer = useCallback(
    (custId) => customers.find(c => c.custId === custId),
    [customers]
  );

  const filtered = orders.filter(o => {
    const matchStatus = !filterStatus || o.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchSearch = !search || String(o.orderId).includes(search) || String(o.custId).includes(search);
    return matchStatus && matchSearch;
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openView = (order) => {
    setViewOrder(order);
    setNewStatus(order.status || '');
    setShowViewModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === viewOrder.status) return;
    setUpdatingStatus(true);
    try {
      await adminService.updateOrderStatus(viewOrder.orderId, newStatus);
      fetchAll();
      setShowViewModal(false);
    } catch (err) {
      showNotify('error', 'Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteOrder(id);
      fetchAll();
    } catch (err) {
      showNotify('error', 'Không thể xóa: ' + (err?.response?.data?.message || err.message));
    }
  };

  const vnd = v => (v || 0).toLocaleString('vi-VN') + ' ₫';

  if (loading) return (
    <div className="dash-loading"><div className="dash-spinner" /><p>Đang tải...</p></div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Đơn hàng</h2>
          <p className="page-subtitle">Quản lý đơn hàng và chi tiết đơn</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Danh sách đơn hàng ({filtered.length})</h3>
          <div className="filter-row">
            <input
              className="search-input"
              placeholder="Tìm theo mã đơn, khách hàng..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select
              className="form-control"
              style={{ width: 180 }}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Địa chỉ giao</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map(o => {
                const cust = getCustomer(o.custId);
                const { label, cls } = getStatusInfo(o.status);
                return (
                  <tr key={o.orderId}>
                    <td><span className="order-id">#ORD-{String(o.orderId).padStart(4, '0')}</span></td>
                    <td>
                      <div>{cust ? `${cust.fName} ${cust.lName}` : `Khách #${o.custId}`}</div>
                      {cust?.email && <div style={{ fontSize: 11, color: '#888' }}>{cust.email}</div>}
                    </td>
                    <td className="desc-cell">{o.shippingAddress || '—'}</td>
                    <td>{new Date(o.orderDate).toLocaleDateString('vi-VN')}</td>
                    <td><strong className="money">{vnd(o.totalPrice)}</strong></td>
                    <td><span className={`status-badge ${cls}`}>{label}</span></td>
                    <td>
                      <ActionButtons
                        onView={() => openView(o)}
                        onDelete={() => handleDelete(o.orderId)}
                        showEdit={false}
                        viewText="Xem / Sửa"
                      />
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="no-data">Không có đơn hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <Pagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={filtered.length}
            onChange={({ page: p, pageSize: ps }) => { setPage(p); setPageSize(ps); }}
          />
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Chi tiết đơn #ORD-${String(viewOrder?.orderId || 0).padStart(4, '0')}`}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              className="form-control"
              style={{ width: 200 }}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="modal-btn modal-confirm-btn" onClick={handleUpdateStatus} disabled={updatingStatus || newStatus === viewOrder?.status}>
              {updatingStatus ? 'Đang lưu...' : 'Cập nhật trạng thái'}
            </button>
            <button className="modal-btn modal-cancel-btn" onClick={() => setShowViewModal(false)}>Đóng</button>
          </div>
        }
      >
        {viewOrder && (
          <div className="order-detail">
            <div className="detail-grid">
              <div className="detail-item"><span className="detail-label">Khách hàng:</span> Khách #{viewOrder.custId}</div>
              <div className="detail-item"><span className="detail-label">Ngày đặt:</span> {new Date(viewOrder.orderDate).toLocaleString('vi-VN')}</div>
              <div className="detail-item"><span className="detail-label">Tổng tiền:</span> <strong className="money">{vnd(viewOrder.totalPrice)}</strong></div>
              <div className="detail-item"><span className="detail-label">Địa chỉ:</span> {viewOrder.shippingAddress}</div>
              <div className="detail-item"><span className="detail-label">Folder ảnh:</span> <code>{viewOrder.folderName || '—'}</code></div>
              <div className="detail-item">
                <span className="detail-label">Trạng thái:</span>
                <span className={`status-badge ${getStatusInfo(viewOrder.status).cls}`}>{getStatusInfo(viewOrder.status).label}</span>
              </div>
            </div>

            {viewOrder.orderDetails && viewOrder.orderDetails.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.93rem', color: '#1a1a2e' }}>Chi tiết đơn hàng</h4>
                <table className="admin-table" style={{ border: '1px solid #f0f0f0' }}>
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Kích thước</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.orderDetails.map(d => (
                      <tr key={d.orderDetailId}>
                        <td>
                          {d.photo?.filePath ? (
                            <img
                              src={`http://localhost:5002/${d.photo.filePath}`}
                              alt="photo"
                              className="order-thumb"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span style={{ color: '#ccc', fontSize: 11 }}>—</span>
                          )}
                        </td>
                        <td>{d.size?.sizeName || '—'}</td>
                        <td>{d.quantity}</td>
                        <td>{vnd(d.pricePerCopy)}</td>
                        <td><strong className="money">{vnd(d.lineTotal)}</strong></td>
                        <td>{d.noteToAdmin || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OrderPage;
