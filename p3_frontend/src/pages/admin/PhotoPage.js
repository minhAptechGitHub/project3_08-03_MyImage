import React, { useEffect, useState, useMemo } from 'react';
import adminService from '../../services/adminService';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import { Icon } from '@iconify/react';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';
import '../../styles/admin/OrderPage.css';
import '../../styles/admin/PhotoPage.css';

const BASE_URL = 'http://localhost:5002';

function getFolder(filePath) {
  if (!filePath) return 'unknown';
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || 'unknown';
}

function getImgUrl(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.startsWith('http') ? normalized : `${BASE_URL}/${normalized}`;
}

function PhotoPage() {
  const [photos, setPhotos] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [openFolder, setOpenFolder] = useState(null);
  const [folderPage, setFolderPage] = useState(1);
  const folderPageSize = 12;

  const [viewPhoto, setViewPhoto] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        adminService.getPhotos().catch(() => []),
        adminService.getAllCustomers().catch(() => []),
      ]);
      setPhotos(Array.isArray(p) ? p : []);
      setCustomers(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const getCustomer = (custId) => customers.find(c => c.custId === custId);

  const folders = useMemo(() => {
    const map = {};
    photos.forEach(photo => {
      const folder = getFolder(photo.filePath);
      if (!map[folder]) {
        map[folder] = { name: folder, photos: [], custId: photo.custId };
      }
      map[folder].photos.push(photo);
    });
    return Object.values(map).sort((a, b) => {
      const aMax = Math.max(...a.photos.map(p => p.photoId));
      const bMax = Math.max(...b.photos.map(p => p.photoId));
      return bMax - aMax;
    });
  }, [photos]);

  const filteredFolders = useMemo(() => {
    if (!search) return folders;
    const s = search.toLowerCase();
    return folders.filter(f =>
      f.name.toLowerCase().includes(s) ||
      String(f.custId).includes(s) ||
      (() => {
        const c = getCustomer(f.custId);
        return c ? `${c.fName} ${c.lName}`.toLowerCase().includes(s) : false;
      })()
    );
  }, [folders, search, customers]);

  const pagedFolders = filteredFolders.slice((page - 1) * pageSize, page * pageSize);

  const folderPhotos = openFolder
    ? [...openFolder.photos].sort((a, b) => b.photoId - a.photoId)
    : [];

  const pagedFolderPhotos = folderPhotos.slice(
    (folderPage - 1) * folderPageSize,
    folderPage * folderPageSize
  );

  if (loading) return (
    <div className="dash-loading">
      <div className="dash-spinner" />
      <p>Đang tải...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          {openFolder ? (
            <div className="photo-breadcrumb">
              <button
                className="folder-back-btn"
                onClick={() => { setOpenFolder(null); setFolderPage(1); }}
              >
                ← Kho ảnh
              </button>
              <span className="folder-crumb-sep">/</span>
              <span className="folder-crumb-name">
                <Icon icon="noto:file-folder" width="18" /> {openFolder.name}
              </span>
            </div>
          ) : (
            <>
              <h2 className="page-title">Kho ảnh</h2>
              <p className="page-subtitle">Quản lý thư mục ảnh của khách hàng</p>
            </>
          )}
        </div>

        <button className="btn-primary" onClick={fetchAll}>
          ↻ Làm mới
        </button>
      </div>

      {/* FOLDER LIST */}
      {!openFolder && (
        <div className="section-card">
          <div className="section-header">
            <h3>Thư mục ảnh ({filteredFolders.length})</h3>
            <input
              className="search-input"
              placeholder="Tìm theo tên folder, ID hoặc tên khách..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {pagedFolders.length === 0 ? (
            <div className="folder-grid">
              <div className="folder-empty">
                <div className="folder-empty-icon">
                  <Icon icon="noto:file-folder" width="64" />
                </div>
                <p className="folder-empty-text">Không có thư mục ảnh nào</p>
              </div>
            </div>
          ) : (
            <div className="folder-grid">
              {pagedFolders.map(folder => {
                const cust = getCustomer(folder.custId);
                const thumb = folder.photos.find(p => p.filePath)?.filePath;

                const latestDate = folder.photos.reduce((max, p) => {
                  const d = new Date(p.uploadDate);
                  return d > max ? d : max;
                }, new Date(0));

                return (
                  <div
                    key={folder.name}
                    className="folder-card"
                    onClick={() => {
                      setOpenFolder(folder);
                      setFolderPage(1);
                    }}
                  >
                    <div className="folder-thumb">
                      {thumb && (
                        <img
                          src={getImgUrl(thumb)}
                          alt={folder.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      )}
                      <div className="folder-icon-fallback">
                        <Icon icon="noto:file-folder" width="40" />
                      </div>
                      <div className="folder-count-badge">
                        {folder.photos.length} ảnh
                      </div>
                    </div>

                    <div className="folder-info">
                      <p className="folder-name">{folder.name}</p>
                      <p className="folder-meta">
                        <Icon icon="noto:bust-in-silhouette" width="14" /> {cust
                          ? `${cust.fName} ${cust.lName}`
                          : `Khách #${folder.custId}`}
                      </p>
                      <p className="folder-meta">
                        <Icon icon="noto:calendar" width="14" /> {
                          latestDate.getTime() > 0
                            ? latestDate.toLocaleDateString('vi-VN')
                            : '—'
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ padding: '12px 16px' }}>
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              totalItems={filteredFolders.length}
              onChange={({ page: p }) => setPage(p)}
              pageSizes={[12]}
            />
          </div>
        </div>
      )}

      {/* FOLDER DETAIL */}
      {openFolder && (
        <div className="section-card">
          <div className="section-header">
            <h3>{folderPhotos.length} ảnh trong thư mục</h3>
            {openFolder.custId && (() => {
              const c = getCustomer(openFolder.custId);
              return c && (
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                  <Icon icon="noto:bust-in-silhouette" width="16" /> {c.fName} {c.lName}
                </span>
              );
            })()}
          </div>

          {folderPhotos.length === 0 ? (
            <div className="photo-grid">
              <div className="folder-empty">
                <Icon icon="noto:framed-picture" width="40" />
                <p className="folder-empty-text">Thư mục không có ảnh nào</p>
              </div>
            </div>
          ) : (
            <div className="photo-grid">
              {pagedFolderPhotos.map(photo => (
                <div key={photo.photoId} className="photo-card">
                  <div
                    className="photo-card-img"
                    onClick={() => setViewPhoto(photo)}
                  >
                    <img
                      src={getImgUrl(photo.filePath) || 'https://placehold.co/200x150'}
                      alt={photo.fileName}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/200x150?text=Lỗi';
                      }}
                    />
                    <div className="photo-overlay">
                      <Icon icon="noto:eye" width="16" /> Xem
                    </div>
                  </div>

                  <div className="photo-card-info">
                    <p className="photo-name">{photo.fileName}</p>
                    <p className="photo-meta">
                      <Icon icon="noto:calendar" width="14" /> {
                        photo.uploadDate
                          ? new Date(photo.uploadDate).toLocaleDateString('vi-VN')
                          : '—'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 16px' }}>
            <Pagination
              currentPage={folderPage}
              pageSize={folderPageSize}
              totalItems={folderPhotos.length}
              onChange={({ page: p }) => setFolderPage(p)}
              pageSizes={[12]}
            />
          </div>
        </div>
      )}

      {/* VIEW PHOTO MODAL */}
      {viewPhoto && (
        <Modal
          isOpen={!!viewPhoto}
          onClose={() => setViewPhoto(null)}
          title={viewPhoto.fileName}
          size="medium"
          footer={
            <button
              className="modal-btn modal-cancel-btn"
              onClick={() => setViewPhoto(null)}
            >
              Đóng
            </button>
          }
        >
          <div style={{ textAlign: 'center' }}>
            <img
              src={getImgUrl(viewPhoto.filePath)}
              alt={viewPhoto.fileName}
              style={{
                maxWidth: '100%',
                maxHeight: 420,
                borderRadius: 8,
                border: '1px solid #eee'
              }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PhotoPage;