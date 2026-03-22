import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import ActionButtons from '../../components/ActionButton';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';
import '../../styles/admin/OrderPage.css';

import { useOutletContext } from 'react-router-dom';

const emptyPayment = { orderId: '', paymentMethod: 'Cash', amount: '', paymentDate: '', note: '' };

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const { showNotify } = useOutletContext();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, o] = await Promise.all([
        adminService.getPayments().catch(() => []),
        adminService.getAllOrders().catch(() => []),
      ]);
      setPayments(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getOrder = (orderId) => orders.find(o => o.orderId === orderId);

  const filtered = payments.filter(p =>
    !search ||
    String(p.paymentId).includes(search) ||
    String(p.orderId).includes(search) ||
    (p.paymentMethod || '').toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => { setEditData({ ...emptyPayment }); setShowModal(true); };
  const openEdit = (p) => {
    setEditData({
      ...p,
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editData.orderId || !editData.amount) return showNotify('error', 'Vui lòng nhập đầy đủ thông tin.');
    setSaving(true);
    try {
      const payload = {
        ...editData,
        orderId: Number(editData.orderId),
        amount: parseFloat(editData.amount),
        paymentDate: editData.paymentDate ? new Date(editData.paymentDate).toISOString() : new Date().toISOString(),
      };
      if (editData.paymentId) {
        await adminService.updatePayment(editData.paymentId, payload);
      } else {
        await adminService.createPayment(payload);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      showNotify('error', 'Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deletePayment(id);
      fetchAll();
    } catch (err) {
      showNotify('error', 'Không thể xóa: ' + (err?.response?.data?.message || err.message));
    }
  };

  const vnd = v => (Number(v) || 0).toLocaleString('vi-VN') + ' ₫';

  if (loading) return (
    <div className="dash-loading"><div className="dash-spinner" /><p>Đang tải...</p></div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Giao dịch</h2>
          <p className="page-subtitle">Quản lý thanh toán và xác minh giao dịch</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Thêm giao dịch</button>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Danh sách giao dịch ({filtered.length})</h3>
          <input
            className="search-input"
            placeholder="Tìm theo ID, mã đơn..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn hàng</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Ngày TT</th>
                <th>Ghi chú</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map(p => {
                const order = getOrder(p.orderId);
                return (
                  <tr key={p.paymentId}>
                    <td>#{p.paymentId}</td>
                    <td>
                      <span className="order-id">#ORD-{String(p.orderId).padStart(4, '0')}</span>
                      {order && <div style={{ fontSize: 11, color: '#888' }}>{order.status}</div>}
                    </td>
                    <td>
                      <span className={`method-badge ${p.paymentMethod?.toLowerCase() === 'cash' ? 'cash' : 'card'}`}>
                        {p.paymentMethod?.toLowerCase() === 'cash' ? '💵 Tiền mặt' : '💳 ' + (p.paymentMethod || 'Thẻ')}
                      </span>
                    </td>
                    <td><strong className="money">{vnd(p.amount)}</strong></td>
                    <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('vi-VN') : '—'}</td>
                    <td className="desc-cell">{p.note || '—'}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => openEdit(p)}
                        onDelete={() => handleDelete(p.paymentId)}
                        showView={false}
                      />
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" className="no-data">Chưa có giao dịch nào</td></tr>
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editData?.paymentId ? 'Sửa giao dịch' : 'Thêm giao dịch'}
        onConfirm={handleSave}
        loading={saving}
        confirmText="Lưu"
        size="small"
      >
        {editData && (
          <div>
            <div className="form-group">
              <label>Mã đơn hàng *</label>
              <select className="form-control" value={editData.orderId || ''} onChange={(e) => setEditData({ ...editData, orderId: e.target.value })}>
                <option value="">— Chọn đơn hàng —</option>
                {orders.map(o => (
                  <option key={o.orderId} value={o.orderId}>
                    #ORD-{String(o.orderId).padStart(4, '0')} — {o.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phương thức TT</label>
                <select className="form-control" value={editData.paymentMethod || 'Cash'} onChange={(e) => setEditData({ ...editData, paymentMethod: e.target.value })}>
                  <option value="Cash">Tiền mặt</option>
                  <option value="Card">Thẻ ngân hàng</option>
                  <option value="Transfer">Chuyển khoản</option>
                  <option value="MoMo">Ví MoMo</option>
                </select>
              </div>
              <div className="form-group">
                <label>Số tiền (VNĐ) *</label>
                <input className="form-control" type="number" min="0" value={editData.amount || ''} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label>Ngày thanh toán</label>
              <input className="form-control" type="date" value={editData.paymentDate || ''} onChange={(e) => setEditData({ ...editData, paymentDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea className="form-control" rows={2} value={editData.note || ''} onChange={(e) => setEditData({ ...editData, note: e.target.value })} placeholder="Ghi chú thêm..." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PaymentPage;
