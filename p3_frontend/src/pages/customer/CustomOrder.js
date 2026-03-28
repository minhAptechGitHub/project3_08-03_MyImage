import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import '../../styles/customer/customOrder.css';
import { Icon } from '@iconify/react';

import { useOutletContext } from 'react-router-dom';

function CustomOrder() {
  const navigate = useNavigate();

  const raw = JSON.parse(localStorage.getItem('user') || '{}');
  const user = {
    ...raw,
    custId: raw.custId || raw.CustId || raw.id || raw.Id
  };

  const [form, setForm] = useState({
    fullName: user.fullName || user.FullName || '',
    email: user.email || user.Email || '',
    phone: user.phone || user.Phone || '',
    address: user.address || user.Address || '',
    deliveryDate: '',
    note: ''
  });

  const [photos, setPhotos] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { showNotify } = useOutletContext();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addFiles = (files) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const newPhotos = imageFiles.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleFileInput = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = [];
    if (!form.fullName.trim()) errors.push('Vui lòng nhập họ tên.');
    if (!form.email.trim()) errors.push('Vui lòng nhập email.');
    if (!form.phone.trim()) errors.push('Vui lòng nhập số điện thoại.');
    if (!form.address.trim()) errors.push('Vui lòng nhập địa chỉ.');
    if (!form.deliveryDate) errors.push('Vui lòng chọn ngày giao hàng.');
    if (!form.note.trim()) errors.push('Vui lòng nhập yêu cầu in.');
    if (photos.length === 0) errors.push('Vui lòng upload ít nhất 1 file ảnh.');

    errors.forEach(msg => showNotify?.('error', msg));
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!user.custId) {
      showNotify('error', 'Vui lòng đăng nhập để gửi yêu cầu.');
      navigate('/auth/login');
      return;
    }

    if (!validate()) return;
    setSubmitting(true);


    try {
      const draft = await userService.createDraftOrder({
        custId: user.custId,
        shippingAddress: form.address,
        status: 'Pending'
      });

      const orderId = draft.orderId || draft.OrderId;
      if (!orderId) throw new Error('Không lấy được orderId từ server');

      for (const photo of photos) {
        const formData = new FormData();
        formData.append('file', photo.file);
        formData.append('orderId', orderId);

        const uploadResult = await userService.uploadPhoto(formData);
        const fileName = uploadResult.fileName || uploadResult.FileName;
        const filePath = uploadResult.filePath || uploadResult.FilePath;

        const photoRecord = await userService.createPhoto({
          custId: user.custId,
          fileName,
          filePath,
          uploadDate: new Date().toISOString()
        });

        const photoId = photoRecord.photoId || photoRecord.PhotoId;

        await userService.createOrderDetail({
          orderId,
          photoId,
          sizeId: null,
          quantity: 1,
          pricePerCopy: 0,
          noteToAdmin: form.note.trim()
        });
      }

      await userService.updateOrder(orderId, {
        orderId,
        custId: user.custId,
        shippingAddress: form.address,
        status: 'Pending',
        totalPrice: 0,
        orderDate: new Date().toISOString()
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      showNotify('error', 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="custom-order-page">
        <div className="custom-success">
          <div className="success-icon">
            <Icon icon="twemoji:party-popper" width="40" />
          </div>
          <h2>Gửi yêu cầu thành công!</h2>
          <p>Chúng tôi sẽ liên hệ với bạn qua email hoặc điện thoại để xác nhận đơn in theo yêu cầu.</p>
          <div className="success-actions">
            <button className="btn-back" onClick={() => navigate('/')}>
              <Icon icon="twemoji:house" style={{ marginRight: '6px' }} />
              Về trang chủ
            </button>

            <button className="btn-next" onClick={() => navigate('/orders')}>
              Xem đơn hàng
              <Icon icon="twemoji:right-arrow" style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-order-page">
      <div className="custom-order-header">
        <h1>In ảnh theo yêu cầu</h1>
        <p>Điền thông tin và upload file — chúng tôi sẽ tư vấn & báo giá cho bạn</p>
        <div style={{ width: '100%', textAlign: 'left', marginBottom: '8px', marginLeft: '200px' }}>
          <span
            onClick={() => navigate(-1)}
            style={{
              color: '#2196f3',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← Quay lại
          </span>
        </div>
      </div>

      <div className="custom-order-body">

        {/* LEFT: FORM */}
        <div className="custom-form-panel">
          <div className="panel-title">
            <Icon icon="twemoji:bust-in-silhouette" width="20" style={{ marginRight: '6px' }} />
            Thông tin khách hàng
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Họ và tên <span className="req">*</span></label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-field">
              <label>Địa chỉ E-Mail <span className="req">*</span></label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
              />
            </div>

            <div className="form-field">
              <label>Điện thoại <span className="req">*</span></label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0901 234 567"
              />
            </div>

            <div className="form-field">
              <label>Ngày giao hàng mong muốn <span className="req">*</span></label>
              <input
                name="deliveryDate"
                type="date"
                value={form.deliveryDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-field full">
            <label>Địa chỉ giao hàng <span className="req">*</span></label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
            />
          </div>

          <div className="form-field full">
            <label>Yêu cầu in <span className="req">*</span></label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={5}
              placeholder="Tên sản phẩm - Kích thước - Màu sắc - Số lượng - Yêu cầu đặc biệt..."
            />
          </div>

          <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang gửi...' : (
              <>
                <Icon icon="twemoji:outbox-tray" style={{ marginRight: '6px' }} />
                Gửi yêu cầu
              </>
            )}
          </button>
        </div>

        {/* RIGHT: UPLOAD */}
        <div className="custom-upload-panel">
          <div className="upload-header">
            <span>GỬI FILE NHANH</span>
            <small>Bạn có thể nén file dạng .rar nếu số lượng file nhiều</small>
          </div>

          <div
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('customFileInput').click()}
          >
            <input
              id="customFileInput"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              hidden
            />
            <div className="drop-icon">
              <Icon icon="twemoji:file-folder" width="40" />
            </div>
            <p>Kéo và thả hình của bạn<br />hoặc click vào đây</p>
            <span>Định dạng hỗ trợ: JPG, PNG, WEBP</span>
          </div>

          <div className="file-count">
            Tổng số file đã tải: <strong>{photos.length}</strong>
          </div>

          {photos.length > 0 && (
            <div className="upload-thumb-grid">
              {photos.map((p, i) => (
                <div key={i} className="upload-thumb">
                  <img src={p.preview} alt={p.name} />
                  <button onClick={() => removePhoto(i)}>
                    <Icon icon="twemoji:cross-mark" />
                  </button>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CustomOrder;