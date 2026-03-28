import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import ActionButtons from '../../components/ActionButton';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { Icon } from '@iconify/react';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';
import '../../styles/admin/OrderPage.css';

const STATUSES = ['Pending', 'Payment Verified', 'Processing', 'Printed', 'Shipped', 'Completed', 'Cancelled'];

const PAYMENT_METHODS = ['VNPay', 'COD'];

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', cls: 'pending' },
  'payment verified': { label: 'Đã xác nhận TT', cls: 'payment-verified' },
  processing: { label: 'Đang xử lý', cls: 'processing' },
  printed: { label: 'Đã in', cls: 'printed' },
  shipped: { label: 'Đang giao', cls: 'shipped' },
  completed: { label: 'Hoàn thành', cls: 'completed' },
  cancelled: { label: 'Đã hủy', cls: 'cancelled' },
};

const METHOD_MAP = {
  vnpay: { label: 'VNPay', icon: 'noto:credit-card', cls: 'card' },
  cod: { label: 'COD', icon: 'noto:delivery-truck', cls: 'cash' },
};

function getStatusInfo(status = '') {
  return STATUS_MAP[status.toLowerCase()] || { label: status, cls: 'pending' };
}

function getMethodInfo(method = '') {
  return METHOD_MAP[method.toLowerCase()] || { label: method || '—', icon: null, cls: '' };
}

const isCustomOrder = (order) =>
  Number(order.totalPrice) === 0 &&
  order.orderDetails?.some(d => d.size === null || d.size === undefined);

function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewOrder, setViewOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 'Cash', amount: '', note: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [o, c, p] = await Promise.all([
        adminService.getAllOrders().catch(() => []),
        adminService.getAllCustomers().catch(() => []),
        adminService.getPayments().catch(() => []),
      ]);
      setOrders(Array.isArray(o) ? o.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)) : []);
      setCustomers(Array.isArray(c) ? c : []);
      setPayments(Array.isArray(p) ? p : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getCustomer = (custId) => customers.find(c => c.custId === custId);
  const getPayment = (orderId) => payments.find(p => p.orderId === orderId);

  const filtered = orders.filter(o => {
    const matchStatus = !filterStatus || o.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchSearch = !search || String(o.orderId).includes(search) || String(o.custId).includes(search);
    const custom = isCustomOrder(o);
    const matchType = !filterType
      || (filterType === 'custom' && custom)
      || (filterType === 'standard' && !custom);
    return matchStatus && matchSearch && matchType;
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openView = (order) => {
    setViewOrder(order);
    setNewStatus(order.status || '');
    const existingPayment = getPayment(order.orderId);
    setPaymentForm({
      paymentMethod: existingPayment?.paymentMethod || 'Cash',
      amount: existingPayment?.amount || order.totalPrice || '',
      note: existingPayment?.note || '',
    });
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
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSavePayment = async () => {
    if (!paymentForm.amount) return alert('Vui lòng nhập số tiền.');
    setSavingPayment(true);
    try {
      const existing = getPayment(viewOrder.orderId);
      const payload = {
        orderId: viewOrder.orderId,
        paymentMethod: paymentForm.paymentMethod,
        amount: parseFloat(paymentForm.amount),
        paymentDate: new Date().toISOString(),
        note: paymentForm.note,
      };
      if (existing) {
        await adminService.updatePayment(existing.paymentId, { ...payload, paymentId: existing.paymentId });
      } else {
        await adminService.createPayment(payload);
      }
      fetchAll();
      alert('Đã lưu thông tin thanh toán.');
    } catch (err) {
      alert('Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingPayment(false);
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
              style={{ width: 160 }}
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả loại</option>
              <option value="standard">In theo loại</option>
              <option value="custom">Theo yêu cầu</option>
            </select>
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
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map(o => {
                const cust = getCustomer(o.custId);
                const { label, cls } = getStatusInfo(o.status);
                const custom = isCustomOrder(o);
                const payment = getPayment(o.orderId);
                const methodInfo = getMethodInfo(payment?.paymentMethod || '');
                return (
                  <tr key={o.orderId}>
                    <td>
                      <span className="order-id">#ORD-{String(o.orderId).padStart(4, '0')}</span>
                      {custom && <span className="custom-order-tag">Theo yêu cầu</span>}
                    </td>
                    <td>
                      <div>{cust ? `${cust.fName} ${cust.lName}` : `Khách #${o.custId}`}</div>
                      {cust?.email && <div style={{ fontSize: 11, color: '#888' }}>{cust.email}</div>}
                    </td>
                    <td>{new Date(o.orderDate + 'Z').toLocaleDateString('vi-VN')}</td>
                    <td>
                      {custom
                        ? <span className="pending-quote">Chờ báo giá</span>
                        : <strong className="money">{vnd(o.totalPrice)}</strong>
                      }
                    </td>
                    <td>
                      {payment
                        ? <span className={`method-badge ${methodInfo.cls}`}>
                            {methodInfo.icon && <Icon icon={methodInfo.icon} width="14" style={{ marginRight: 4 }} />}
                            {methodInfo.label}
                          </span>
                        : <span style={{ color: '#ccc', fontSize: 12 }}>Chưa có</span>
                      }
                    </td>
                    <td><span className={`status-badge ${cls}`}>{label}</span></td>
                    <td>
                      <ActionButtons
                        onView={() => openView(o)}
                        showEdit={false}
                        showDelete={false}
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
            <button
              className="modal-btn modal-confirm-btn"
              onClick={handleUpdateStatus}
              disabled={updatingStatus || newStatus === viewOrder?.status}
            >
              {updatingStatus ? 'Đang lưu...' : 'Cập nhật trạng thái'}
            </button>
            <button className="modal-btn modal-cancel-btn" onClick={() => setShowViewModal(false)}>Đóng</button>
          </div>
        }
      >
        {viewOrder && (() => {
          const custom = isCustomOrder(viewOrder);
          const sharedNote = viewOrder.orderDetails?.find(d => d.noteToAdmin)?.noteToAdmin;
          const existingPayment = getPayment(viewOrder.orderId);
          return (
            <div className="order-detail">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Loại đơn:</span>
                  {custom ? <span className="custom-order-tag">Theo yêu cầu</span> : <span>In theo loại</span>}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Khách hàng:</span> Khách #{viewOrder.custId}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Ngày đặt:</span>
                  {new Date(viewOrder.orderDate + 'Z').toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tổng tiền:</span>
                  {custom ? <span className="pending-quote">Chờ báo giá</span> : <strong className="money">{vnd(viewOrder.totalPrice)}</strong>}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Địa chỉ:</span> {viewOrder.shippingAddress}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Folder ảnh:</span> <code>{viewOrder.folderName || '—'}</code>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trạng thái:</span>
                  <span className={`status-badge ${getStatusInfo(viewOrder.status).cls}`}>
                    {getStatusInfo(viewOrder.status).label}
                  </span>
                </div>
              </div>

              {/* THANH TOÁN */}
              <div className="payment-section">
                <h4 className="payment-section-title">
                  <Icon icon="noto:credit-card" width="18" style={{ marginRight: 6 }} />
                  Thông tin thanh toán
                  {existingPayment && <span className="paid-badge">Đã có</span>}
                </h4>
                <div className="payment-form-row">
                  <div className="form-group">
                    <label>Phương thức</label>
                    <select
                      className="form-control"
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm(p => ({ ...p, paymentMethod: e.target.value }))}
                    >
                      {PAYMENT_METHODS.map(m => (
                        <option key={m} value={m}>
                          {m === 'VNPay' ? 'VNPay' : 'COD (Thanh toán khi nhận hàng)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Số tiền (VNĐ)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Ghi chú</label>
                    <input
                      className="form-control"
                      value={paymentForm.note}
                      onChange={(e) => setPaymentForm(p => ({ ...p, note: e.target.value }))}
                      placeholder="Ghi chú thanh toán..."
                    />
                  </div>
                  <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                    <button
                      className="modal-btn modal-confirm-btn"
                      onClick={handleSavePayment}
                      disabled={savingPayment}
                    >
                      {savingPayment ? 'Đang lưu...' : existingPayment ? 'Cập nhật TT' : 'Lưu TT'}
                    </button>
                  </div>
                </div>
              </div>

              {/* YÊU CẦU IN */}
              {custom && sharedNote && (
                <div className="custom-request-box">
                  <div className="custom-request-title">
                    <Icon icon="noto:clipboard" width="18" style={{ marginRight: 6 }} />
                    Yêu cầu in của khách
                  </div>
                  <p>{sharedNote}</p>
                </div>
              )}

              {/* BẢNG ẢNH */}
              {viewOrder.orderDetails && viewOrder.orderDetails.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.93rem', color: '#1a1a2e' }}>
                    File ảnh đã gửi ({viewOrder.orderDetails.length} file)
                  </h4>
                  <table className="admin-table" style={{ border: '1px solid #f0f0f0' }}>
                    <thead>
                      <tr>
                        <th>Ảnh</th>
                        <th>Kích thước</th>
                        <th>Số lượng</th>
                        {!custom && <th>Đơn giá</th>}
                        {!custom && <th>Thành tiền</th>}
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
                          <td>{d.size?.sizeName || <span style={{ color: '#aaa' }}>Chờ tư vấn</span>}</td>
                          <td>{d.quantity}</td>
                          {!custom && <td>{vnd(d.pricePerCopy)}</td>}
                          {!custom && <td><strong className="money">{vnd(d.lineTotal)}</strong></td>}
                          <td>{d.noteToAdmin || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

export default OrderPage;