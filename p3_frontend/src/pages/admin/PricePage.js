import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import ActionButtons from '../../components/ActionButton';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';

import { useOutletContext } from 'react-router-dom';

const emptySize = { templateId: '', sizeName: '', price: '', isAvailable: true };

function PricePage() {
  const [sizes, setSizes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTemplate, setFilterTemplate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const { showNotify } = useOutletContext();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        adminService.getPrintSizes().catch(() => []),
        adminService.getTemplates().catch(() => []),
      ]);
      setSizes(Array.isArray(s) ? s : []);
      setTemplates(Array.isArray(t) ? t : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filterTemplate
    ? sizes.filter(s => String(s.templateId) === String(filterTemplate))
    : sizes;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => { setEditData({ ...emptySize }); setShowModal(true); };
  const openEdit = (s) => { setEditData({ ...s }); setShowModal(true); };

  const handleSave = async () => {
    if (!editData.templateId || !editData.sizeName?.trim() || !editData.price) {
      return showNotify('error', 'Vui lòng điền đầy đủ thông tin.');
    }
    setSaving(true);
    try {
      const payload = {
        ...editData,
        templateId: Number(editData.templateId),
        price: parseFloat(editData.price),
      };
      if (editData.sizeId) {
        await adminService.updatePrintSize(editData.sizeId, payload);
      } else {
        await adminService.createPrintSize(payload);
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
      await adminService.deletePrintSize(id);
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
          <h2 className="page-title">Bảng giá</h2>
          <p className="page-subtitle">Quản lý kích thước và giá in ảnh</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>+ Thêm kích thước</button>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Danh sách kích thước ({filtered.length})</h3>
          <select
            className="form-control"
            style={{ width: 220 }}
            value={filterTemplate}
            onChange={(e) => { setFilterTemplate(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả sản phẩm</option>
            {templates.map(t => (
              <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Loại sản phẩm</th>
                <th>Kích thước</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map(s => (
                <tr key={s.sizeId}>
                  <td>#{s.sizeId}</td>
                  <td>{templates.find(t => t.templateId === s.templateId)?.templateName || `#${s.templateId}`}</td>
                  <td><strong>{s.sizeName}</strong></td>
                  <td><span className="money">{vnd(s.price)}</span></td>
                  <td>
                    <span className={`status-badge ${s.isAvailable ? 'completed' : 'cancelled'}`}>
                      {s.isAvailable ? 'Có sẵn' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      onEdit={() => openEdit(s)}
                      onDelete={() => handleDelete(s.sizeId)}
                      showView={false}
                    />
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="no-data">Không có dữ liệu</td></tr>
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
        title={editData?.sizeId ? 'Sửa kích thước' : 'Thêm kích thước mới'}
        onConfirm={handleSave}
        loading={saving}
        confirmText="Lưu"
        size="small"
      >
        {editData && (
          <div>
            <div className="form-group">
              <label>Loại sản phẩm *</label>
              <select className="form-control" value={editData.templateId || ''} onChange={(e) => setEditData({ ...editData, templateId: e.target.value })}>
                <option value="">— Chọn sản phẩm —</option>
                {templates.map(t => (
                  <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tên kích thước *</label>
              <input className="form-control" value={editData.sizeName || ''} onChange={(e) => setEditData({ ...editData, sizeName: e.target.value })} placeholder="VD: 10x15 cm" />
            </div>
            <div className="form-group">
              <label>Giá (VNĐ) *</label>
              <input className="form-control" type="number" min="0" value={editData.price || ''} onChange={(e) => setEditData({ ...editData, price: e.target.value })} placeholder="VD: 3000" />
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="form-control" value={editData.isAvailable ? 'true' : 'false'} onChange={(e) => setEditData({ ...editData, isAvailable: e.target.value === 'true' })}>
                <option value="true">Có sẵn</option>
                <option value="false">Ngừng bán</option>
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PricePage;