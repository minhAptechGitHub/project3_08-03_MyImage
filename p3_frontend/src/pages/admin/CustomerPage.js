import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import ActionButtons from '../../components/ActionButton';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { Icon } from '@iconify/react';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';
import '../../styles/admin/OrderPage.css';

import { useOutletContext } from 'react-router-dom';

function CustomerPage() {
  const [tab, setTab] = useState('customers');
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [adminPage, setAdminPage] = useState(1);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [viewCustomer, setViewCustomer] = useState(null);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);

  const { showNotify } = useOutletContext();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([
        adminService.getAllCustomers().catch(() => []),
        adminService.getAllAdmins().catch(() => []),
      ]);
      setCustomers(Array.isArray(c) ? [...c].sort((a, b) => b.custId - a.custId) : []);
      setAdmins(Array.isArray(a) ? [...a].sort((a, b) => b.adminId - a.adminId) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredCustomers = customers.filter(c =>
    !search ||
    (c.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.fName + ' ' + c.lName).toLowerCase().includes(search.toLowerCase())
  );

  const pagedCustomers = filteredCustomers.slice((page - 1) * pageSize, page * pageSize);
  const pagedAdmins = admins.slice((adminPage - 1) * pageSize, adminPage * pageSize);

  const toggleActive = async (cust) => {
    try {
      await adminService.updateCustomer(cust.custId, { ...cust, isActive: !cust.isActive });
      fetchAll();
    } catch (err) {
      showNotify('error', 'Lỗi: ' + (err?.response?.data?.message || err.message));
    }
  };

  const openCreateAdmin = () => {
    setEditAdmin(null);
    setAdminForm({ username: '', password: '' });
    setShowAdminModal(true);
  };

  const openEditAdmin = (a) => {
    setEditAdmin(a);
    setAdminForm({ username: a.username, password: '' });
    setShowAdminModal(true);
  };

  const handleSaveAdmin = async () => {
    if (!adminForm.username?.trim()) return showNotify('error', 'Vui lòng nhập username.');
    if (!editAdmin && !adminForm.password?.trim()) return showNotify('error', 'Vui lòng nhập mật khẩu.');
    setSavingAdmin(true);
    try {
      if (editAdmin) {
        await adminService.updateAdmin(editAdmin.adminId, {
          ...editAdmin,
          username: adminForm.username,
          ...(adminForm.password ? { password: adminForm.password } : {}),
        });
      } else {
        await adminService.createAdmin({ username: adminForm.username, password: adminForm.password });
      }
      setShowAdminModal(false);
      fetchAll();
    } catch (err) {
      showNotify('error', 'Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingAdmin(false);
    }
  };

  if (loading) return (
    <div className="dash-loading"><div className="dash-spinner" /><p>Đang tải...</p></div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Người dùng</h2>
          <p className="page-subtitle">Quản lý tài khoản khách hàng và quản trị viên</p>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>
          <Icon icon="noto:busts-in-silhouette" width="18" /> Khách hàng ({customers.length})
        </button>
        <button className={`tab-btn ${tab === 'admins' ? 'active' : ''}`} onClick={() => setTab('admins')}>
          <Icon icon="noto:key" width="18" /> Quản trị viên ({admins.length})
        </button>
      </div>

      {tab === 'customers' && (
        <div className="section-card">
          <div className="section-header">
            <h3>Danh sách khách hàng ({filteredCustomers.length})</h3>
            <input
              className="search-input"
              placeholder="Tìm theo tên, email, username..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedCustomers.length > 0 ? pagedCustomers.map(c => (
                  <tr key={c.custId}>
                    <td>#{c.custId}</td>
                    <td><strong>{c.fName} {c.lName}</strong></td>
                    <td><code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{c.username}</code></td>
                    <td>{c.email || '—'}</td>
                    <td>{c.pNo || '—'}</td>
                    <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      <span className={`status-badge ${c.isActive ? 'completed' : 'cancelled'}`}>
                        {c.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td>
                      <ActionButtons
                        onView={() => { setViewCustomer(c); setShowCustomerModal(true); }}
                        onEdit={() => toggleActive(c)}
                        editText={c.isActive ? 'Khóa' : 'Mở khóa'}
                        viewText="Chi tiết"
                      />
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="no-data">Không có khách hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={filteredCustomers.length}
              onChange={({ page: p, pageSize: ps }) => { setPage(p); setPageSize(ps); }}
            />
          </div>
        </div>
      )}

      {tab === 'admins' && (
        <div className="section-card">
          <div className="section-header">
            <h3>Danh sách Admin ({admins.length})</h3>
            <button className="btn-primary" onClick={openCreateAdmin}>+ Thêm Admin</button>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedAdmins.length > 0 ? pagedAdmins.map(a => (
                  <tr key={a.adminId}>
                    <td>#{a.adminId}</td>
                    <td><strong>{a.username}</strong></td>
                    <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => openEditAdmin(a)}
                        showView={false}
                      />
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="no-data">Không có admin nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <Pagination
              currentPage={adminPage}
              pageSize={pageSize}
              totalItems={admins.length}
              onChange={({ page: p }) => setAdminPage(p)}
            />
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT KHÁCH HÀNG */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Chi tiết khách hàng"
        size="small"
        footer={<button className="modal-btn modal-cancel-btn" onClick={() => setShowCustomerModal(false)}>Đóng</button>}
      >
        {viewCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['ID', `#${viewCustomer.custId}`],
              ['Họ tên', `${viewCustomer.fName} ${viewCustomer.lName}`],
              ['Username', viewCustomer.username],
              ['Email', viewCustomer.email || '—'],
              ['Điện thoại', viewCustomer.pNo || '—'],
              ['Địa chỉ', viewCustomer.address || '—'],
              ['Giới tính', viewCustomer.gender === 'M' ? 'Nam' : viewCustomer.gender === 'F' ? 'Nữ' : '—'],
              ['Ngày sinh', viewCustomer.dob ? new Date(viewCustomer.dob).toLocaleDateString('vi-VN') : '—'],
              ['Trạng thái', viewCustomer.isActive ? 'Hoạt động' : 'Bị khóa'],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontWeight: 600, color: '#666', minWidth: 90, fontSize: '0.85rem' }}>{label}:</span>
                <span style={{ color: '#333', fontSize: '0.88rem' }}>{val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* MODAL ADMIN */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title={editAdmin ? 'Sửa Admin' : 'Thêm Admin mới'}
        onConfirm={handleSaveAdmin}
        loading={savingAdmin}
        confirmText="Lưu"
        size="small"
      >
        <div>
          <div className="form-group">
            <label>Username *</label>
            <input className="form-control" value={adminForm.username} onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })} placeholder="Nhập username..." />
          </div>
          <div className="form-group">
            <label>Mật khẩu {editAdmin ? '(để trống nếu không đổi)' : '*'}</label>
            <input className="form-control" type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} placeholder="Nhập mật khẩu mới..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CustomerPage;