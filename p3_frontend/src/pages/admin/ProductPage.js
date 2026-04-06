import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import ActionButtons from '../../components/ActionButton';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { Icon } from '@iconify/react';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';
import { useOutletContext } from 'react-router-dom';

const BASE_URL = 'http://localhost:5002';

const emptyTemplate = {
  templateName: '',
  imageUrl: '',
  details: '',
  leadTime: '',
  isActive: true,
  category: '',
  isFeatured: false,
};

const CATEGORY_OPTIONS = [
  { value: 'anh-cong-cuoi', label: 'Ảnh cổng cưới' },
  { value: 'anh-de-ban', label: 'Ảnh để bàn' },
  { value: 'khung-anh',  label: 'Khung ảnh'  },
  { value: 'in-anh',     label: 'In ảnh'      },
];

const getCategoryLabel = (value) =>
  CATEGORY_OPTIONS.find(c => c.value === value)?.label || value || '—';

function ProductPage() {
  const [templates, setTemplates] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('templates');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [galleryPage, setGalleryPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ templateId: '', imageUrl: '', caption: '' });
  const [savingGallery, setSavingGallery] = useState(false);

  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const { showNotify } = useOutletContext();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, g] = await Promise.all([
        adminService.getTemplates().catch(() => []),
        adminService.getProductGalleries().catch(() => []),
      ]);
      setTemplates(Array.isArray(t) ? [...t].sort((a, b) => b.templateId - a.templateId) : []);
      setGalleries(Array.isArray(g) ? [...g].sort((a, b) => b.galleryId - a.galleryId) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditData({ ...emptyTemplate }); setShowModal(true); };
  const openEdit = (t) => { setEditData({ ...t }); setShowModal(true); };

  const handleSave = async () => {
    if (!editData.templateName?.trim()) {
      showNotify('error', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    setSaving(true);
    try {
      if (editData.templateId) {
        await adminService.updateTemplate(editData.templateId, editData);
      } else {
        await adminService.createTemplate(editData);
      }
      showNotify('success', 'Lưu thành công!');
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
      await adminService.deleteTemplate(id);
      fetchAll();
    } catch (err) {
      showNotify('error', 'Không thể xóa: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleDeleteGallery = async (id) => {
    try {
      await adminService.deleteGallery(id);
      fetchAll();
    } catch (err) {
      showNotify('error', 'Không thể xóa ảnh: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleUploadTemplate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingTemplate(true);
    try {
      const res = await adminService.uploadTemplateImage(file);
      setEditData(prev => ({ ...prev, imageUrl: res.filePath }));
    } catch (err) {
      showNotify('error', 'Upload thất bại: ' + (err?.response?.data || err.message));
    } finally {
      setUploadingTemplate(false);
    }
  };

  const handleUploadGallery = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingGallery(true);
    try {
      const res = await adminService.uploadGalleryImage(file);
      setGalleryForm(prev => ({ ...prev, imageUrl: res.filePath }));
    } catch (err) {
      showNotify('error', 'Upload thất bại: ' + (err?.response?.data || err.message));
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleSaveGallery = async () => {
    if (!galleryForm.templateId || !galleryForm.imageUrl?.trim())
      return showNotify('error', 'Vui lòng chọn sản phẩm và upload ảnh.');
    setSavingGallery(true);
    try {
      await adminService.createGallery({
        templateId: Number(galleryForm.templateId),
        imageUrl: galleryForm.imageUrl,
        caption: galleryForm.caption,
      });
      setShowGalleryModal(false);
      setGalleryForm({ templateId: '', imageUrl: '', caption: '' });
      fetchAll();
    } catch (err) {
      showNotify('error', 'Lỗi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingGallery(false);
    }
  };

  const pagedTemplates = templates.slice((page - 1) * pageSize, page * pageSize);
  const pagedGalleries = galleries.slice((galleryPage - 1) * 12, galleryPage * 12);

  if (loading) return (
    <div className="dash-loading"><div className="dash-spinner" /><p>Đang tải...</p></div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Sản phẩm</h2>
          <p className="page-subtitle">Quản lý mẫu sản phẩm và ảnh mẫu</p>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'templates' ? 'active' : ''}`} onClick={() => setTab('templates')}>
          <Icon icon="noto:framed-picture" width="18" /> Mẫu sản phẩm ({templates.length})
        </button>
        <button className={`tab-btn ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}>
          <Icon icon="noto:camera-with-flash" width="18" /> Ảnh mẫu ({galleries.length})
        </button>
      </div>

      {tab === 'templates' && (
        <div className="section-card">
          <div className="section-header">
            <h3>Danh sách mẫu sản phẩm</h3>
            <button className="btn-primary" onClick={openCreate}>+ Thêm mới</button>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Thời gian SX</th>
                  <th>Trạng thái</th>
                  <th>Nổi bật</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedTemplates.length > 0 ? pagedTemplates.map(t => (
                  <tr key={t.templateId}>
                    <td>#{t.templateId}</td>
                    <td>
                      <img
                        src={t.imageUrl ? `${BASE_URL}/${t.imageUrl}` : 'https://placehold.co/60x45?text=No+Image'}
                        alt={t.templateName}
                        style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/60x45?text=No+Image'; }}
                      />
                    </td>
                    <td><strong>{t.templateName}</strong></td>
                    <td>{getCategoryLabel(t.category)}</td>
                    <td>{t.leadTime || '—'}</td>
                    <td>
                      <span className={`status-badge ${t.isActive ? 'completed' : 'cancelled'}`}>
                        {t.isActive ? 'Đang bán' : 'Ngừng bán'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {t.isFeatured
                        ? <span className="status-badge completed">Có</span>
                        : <span style={{ color: '#aaa' }}>—</span>}
                    </td>
                    <td className="desc-cell">{t.details || '—'}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => openEdit(t)}
                        onDelete={() => handleDelete(t.templateId)}
                        showView={false}
                      />
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="9" className="no-data">Chưa có mẫu sản phẩm nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={templates.length}
              onChange={({ page: p, pageSize: ps }) => { setPage(p); setPageSize(ps); }}
            />
          </div>
        </div>
      )}

      {tab === 'gallery' && (
        <div className="section-card">
          <div className="section-header">
            <h3>Ảnh mẫu sản phẩm</h3>
            <button className="btn-primary" onClick={() => setShowGalleryModal(true)}>+ Thêm ảnh</button>
          </div>
          <div className="gallery-grid">
            {pagedGalleries.length > 0 ? pagedGalleries.map(g => (
              <div key={g.galleryId} className="gallery-item">
                <div className="gallery-img-wrap">
                  <img
                    src={g.imageUrl ? `${BASE_URL}/${g.imageUrl}` : 'https://placehold.co/200x150?text=No+Image'}
                    alt={g.caption || 'Ảnh mẫu'}
                    onError={(e) => { e.target.src = 'https://placehold.co/200x150?text=No+Image'; }}
                  />
                </div>
                <div className="gallery-info">
                  <p className="gallery-caption">{g.caption || '—'}</p>
                  <p className="gallery-template">
                    {templates.find(t => t.templateId === g.templateId)?.templateName || `Template #${g.templateId}`}
                  </p>
                  <button
                    className="btn btn-delete"
                    style={{ fontSize: 11, padding: '3px 8px', marginTop: 4 }}
                    onClick={() => { if (window.confirm('Xóa ảnh này?')) handleDeleteGallery(g.galleryId); }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )) : (
              <div className="no-data" style={{ padding: 40, textAlign: 'center', width: '100%' }}>Chưa có ảnh mẫu nào</div>
            )}
          </div>
          <div style={{ padding: '12px 16px' }}>
            <Pagination
              currentPage={galleryPage}
              pageSize={12}
              totalItems={galleries.length}
              onChange={({ page: p }) => setGalleryPage(p)}
              pageSizes={[12]}
            />
          </div>
        </div>
      )}

      {/* MODAL TEMPLATE */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editData?.templateId ? 'Sửa mẫu sản phẩm' : 'Thêm mẫu sản phẩm'}
        onConfirm={handleSave}
        loading={saving}
        confirmText="Lưu"
        size="medium"
      >
        {editData && (
          <div>
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input
                className="form-control"
                value={editData.templateName || ''}
                onChange={(e) => setEditData({ ...editData, templateName: e.target.value })}
                placeholder="VD: Photobook Bìa Cứng"
              />
            </div>

            <div className="form-group">
              <label>Danh mục</label>
              <select
                className="form-control"
                value={editData.category || ''}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              >
                <option value="">— Chọn danh mục —</option>
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ảnh đại diện</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleUploadTemplate}
                  disabled={uploadingTemplate}
                />
                {uploadingTemplate && <small style={{ color: '#888' }}>Đang upload...</small>}
                {editData.imageUrl && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={`${BASE_URL}/${editData.imageUrl}`}
                      alt="preview"
                      style={{ maxHeight: 80, borderRadius: 4, border: '1px solid #ddd' }}
                    />
                    <small style={{ display: 'block', color: '#888', marginTop: 4 }}>{editData.imageUrl}</small>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Thời gian sản xuất</label>
                <input
                  className="form-control"
                  value={editData.leadTime || ''}
                  onChange={(e) => setEditData({ ...editData, leadTime: e.target.value })}
                  placeholder="VD: 1-2 ngày"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả chi tiết</label>
              <textarea
                className="form-control"
                rows={3}
                value={editData.details || ''}
                onChange={(e) => setEditData({ ...editData, details: e.target.value })}
                placeholder="Mô tả sản phẩm..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  className="form-control"
                  value={editData.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Đang bán</option>
                  <option value="false">Ngừng bán</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 28 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={editData.isFeatured || false}
                    onChange={(e) => setEditData({ ...editData, isFeatured: e.target.checked })}
                    style={{ width: 16, height: 16 }}
                  />
                  Sản phẩm nổi bật
                </label>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL GALLERY */}
      <Modal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        title="Thêm ảnh mẫu"
        onConfirm={handleSaveGallery}
        loading={savingGallery}
        confirmText="Thêm"
        size="small"
      >
        <div>
          <div className="form-group">
            <label>Loại sản phẩm *</label>
            <select
              className="form-control"
              value={galleryForm.templateId}
              onChange={(e) => setGalleryForm({ ...galleryForm, templateId: e.target.value })}
            >
              <option value="">— Chọn sản phẩm —</option>
              {templates.map(t => (
                <option key={t.templateId} value={t.templateId}>{t.templateName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Ảnh mẫu *</label>
            <input
              type="file"
              className="form-control"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleUploadGallery}
              disabled={uploadingGallery}
            />
            {uploadingGallery && <small style={{ color: '#888' }}>Đang upload...</small>}
            {galleryForm.imageUrl && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={`${BASE_URL}/${galleryForm.imageUrl}`}
                  alt="preview"
                  style={{ maxHeight: 80, borderRadius: 4, border: '1px solid #ddd' }}
                />
                <small style={{ display: 'block', color: '#888', marginTop: 4 }}>{galleryForm.imageUrl}</small>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Chú thích</label>
            <input
              className="form-control"
              value={galleryForm.caption}
              onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
              placeholder="Chú thích ảnh..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ProductPage;