import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import userService from '../../services/userService';
import '../../styles/customer/orderNew.css';

import { useOutletContext } from 'react-router-dom';

import { Icon } from '@iconify/react';

function OrderNew() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');

  const raw = JSON.parse(localStorage.getItem('user') || '{}');
  const user = {
    ...raw,
    custId: raw.custId || raw.CustId || raw.id || raw.Id
  };

  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState(null);
  const [sizes, setSizes] = useState([]);

  const [draftOrderId, setDraftOrderId] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [shippingAddress, setShippingAddress] = useState(user.address || user.Address || '');
  const [noteToAdmin, setNoteToAdmin] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  const dragCounter = useRef(0);

  // Refs để tránh stale closure trong cleanup khi unmount
  const draftOrderIdRef = useRef(null);
  const stepRef = useRef(1);

  const { showNotify } = useOutletContext();

  // Đồng bộ refs với state
  useEffect(() => { draftOrderIdRef.current = draftOrderId; }, [draftOrderId]);
  useEffect(() => { stepRef.current = step; }, [step]);

  // Tự động huỷ draft khi user thoát trang giữa chừng (chưa hoàn tất bước 5)
  useEffect(() => {
    return () => {
      if (draftOrderIdRef.current && stepRef.current < 5) {
        userService.cancelOrder(draftOrderIdRef.current).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!templateId) return;
    const fetchTemplate = async () => {
      try {
        const data = await userService.getTemplateById(templateId);
        setTemplate(data);
        const activeSizes = data.printSizes
          ?.filter(s => s.isAvailable)
          .sort((a, b) => a.price - b.price) || [];
        setSizes(activeSizes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTemplate();
  }, [templateId]);

  const ensureDraftOrder = async () => {
    if (draftOrderId) return draftOrderId;
    if (!user.custId) {
      showNotify('error', 'Vui lòng đăng nhập để đặt hàng.');
      navigate('/auth/login');
      return null;
    }
    const draft = await userService.createDraftOrder({
      custId: user.custId,
      shippingAddress: 'DRAFT',
      status: 'Pending'
    });
    const id = draft.orderId || draft.OrderId;
    setDraftOrderId(id);
    return id;
  };

  const processFiles = async (files) => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const orderId = await ensureDraftOrder();
      if (!orderId) return;

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
          const formData = new FormData();
          formData.append('file', file);
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
          const defaultSize = sizes[0];

          setPhotos(prev => [...prev, {
            preview: URL.createObjectURL(file),
            photoId,
            fileName,
            sizeId: defaultSize?.sizeId || null,
            quantity: 1
          }]);
        } catch (err) {
          console.error('Lỗi upload:', err);
          showNotify('error', `Lỗi khi upload ảnh: ${file.name}`);
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files));
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const updatePhotoSize = (index, sizeId) => {
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, sizeId: Number(sizeId) } : p));
  };

  const updatePhotoQty = (index, delta) => {
    setPhotos(prev => prev.map((p, i) =>
      i === index ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  const handleStep3Next = () => {
    if (!shippingAddress.trim()) return showNotify('error', 'Vui lòng nhập địa chỉ giao hàng.');
    setStep(4);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // 1. Cập nhật thông tin đơn hàng
      await userService.updateOrder(draftOrderId, {
        orderId: draftOrderId,
        custId: user.custId,
        shippingAddress,
        status: 'Pending',
        totalPrice: 0,
        paymentMethod,
        orderDate: new Date().toISOString()
      });

      // 2. Tạo các OrderDetail
      for (const photo of photos) {
        const size = sizes.find(s => s.sizeId === photo.sizeId);
        await userService.createOrderDetail({
          orderId: draftOrderId,
          photoId: photo.photoId,
          sizeId: photo.sizeId,
          quantity: photo.quantity,
          pricePerCopy: size?.price || 0,
          noteToAdmin: noteToAdmin.trim() || null
        });
      }

      if (paymentMethod === 'VNPay') {
        // 3a. Gọi backend để lấy URL thanh toán đã ký
        const res = await userService.createVnPayUrl(draftOrderId, totalPrice);
        const vnpayUrl = res.paymentUrl;
        window.location.href = vnpayUrl;
      } else {
        // 3b. COD: cập nhật PaymentMethod vào Orders + tạo bản ghi Payment
        await userService.updateOrderPaymentMethod(draftOrderId, 'COD');
        try {
          await userService.createPayment({
            orderId: draftOrderId,
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            paymentDate: new Date().toISOString()
          });
        } catch (payErr) {
          // Bỏ qua nếu payment record đã tồn tại (unique constraint trên OrderId)
          console.warn('Payment record đã tồn tại, bỏ qua:', payErr);
        }
        setStep(5);
      }
    } catch (err) {
      console.error(err);
      showNotify('error', 'Có lỗi khi đặt hàng, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = photos.reduce((sum, photo) => {
    const size = sizes.find(s => s.sizeId === photo.sizeId);
    return sum + (size?.price || 0) * photo.quantity;
  }, 0);

  const stepLabels = ['Upload ảnh', 'Chọn kích thước', 'Thông tin', 'Thanh toán'];

  return (
    <div className="order-page">
      <div className="container">

        {step < 5 && (
          <div className="stepper">
            {stepLabels.map((label, i) => (
              <div key={i} className={`step-item ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
                <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
                <span className="step-label">{label}</span>
                {i < 3 && <div className="step-line" />}
              </div>
            ))}
          </div>
        )}

        <div className="order-card">

          {/* ===== BƯỚC 1: UPLOAD ẢNH ===== */}
          {step === 1 && (
            <div className="step-content">
              <h2>Upload ảnh cần in</h2>
              {template && (
                <p className="step-subtitle">Dịch vụ: <strong>{template.templateName}</strong></p>
              )}

              <label
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input type="file" multiple accept="image/*" onChange={handleFileChange} hidden />
                <div className="upload-icon">
                  <Icon icon="twemoji:open-file-folder" width="40" />
                </div>
                <p>{dragging ? 'Thả ảnh vào đây...' : 'Nhấn để chọn ảnh hoặc kéo thả vào đây'}</p>
                <span>Hỗ trợ: JPG, PNG, WEBP</span>
              </label>

              {uploading && (
                <p className="uploading-text">
                  <Icon icon="twemoji:hourglass-not-done" style={{ marginRight: '6px' }} />
                  Đang upload...
                </p>
              )}

              {photos.length > 0 && (
                <div className="photo-grid">
                  {photos.map((p, i) => (
                    <div key={i} className="photo-thumb">
                      <img src={p.preview} alt={p.fileName} />
                      <button className="remove-btn" onClick={() => removePhoto(i)}>
                        <Icon icon="twemoji:cross-mark" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="step-actions">
                <button className="btn-back" onClick={() => navigate(-1)}>← Quay lại</button>
                <button
                  className="btn-next"
                  onClick={() => {
                    if (photos.length === 0) return showNotify('error', 'Vui lòng upload ít nhất 1 ảnh.');
                    setStep(2);
                  }}
                  disabled={uploading}
                >
                  Tiếp theo ({photos.length} ảnh) →
                </button>
              </div>
            </div>
          )}

          {/* ===== BƯỚC 2: CHỌN KÍCH THƯỚC TỪNG ẢNH ===== */}
          {step === 2 && (
            <div className="step-content">
              <h2>Chọn kích thước cho từng ảnh</h2>
              <p className="step-subtitle">Mỗi ảnh có thể có kích thước và số lượng khác nhau</p>

              <div className="per-photo-list">
                {photos.map((photo, i) => {
                  const size = sizes.find(s => s.sizeId === photo.sizeId);
                  const subtotal = (size?.price || 0) * photo.quantity;
                  return (
                    <div key={i} className="per-photo-item">
                      <div className="per-photo-img">
                        <img src={photo.preview} alt={photo.fileName} />
                        <button className="remove-btn" onClick={() => removePhoto(i)}>
                          <Icon icon="twemoji:cross-mark" />
                        </button>
                      </div>
                      <div className="per-photo-controls">
                        <p className="per-photo-name">{photo.fileName}</p>

                        <div className="per-photo-field">
                          <label>Kích thước:</label>
                          <select
                            value={photo.sizeId || ''}
                            onChange={e => updatePhotoSize(i, e.target.value)}
                          >
                            {sizes.map(s => (
                              <option key={s.sizeId} value={s.sizeId}>
                                {s.sizeName} — {Number(s.price).toLocaleString('vi-VN')}đ/ảnh
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="per-photo-field">
                          <label>Số bản in:</label>
                          <div className="qty-control">
                            <button onClick={() => updatePhotoQty(i, -1)}>−</button>
                            <span>{photo.quantity}</span>
                            <button onClick={() => updatePhotoQty(i, 1)}>+</button>
                          </div>
                        </div>

                        <p className="per-photo-subtotal">
                          Thành tiền: <strong className="highlight">{Number(subtotal).toLocaleString('vi-VN')}đ</strong>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="total-bar">
                <span>Tổng cộng ({photos.length} ảnh):</span>
                <strong className="highlight">{Number(totalPrice).toLocaleString('vi-VN')}đ</strong>
              </div>

              <div className="step-actions">
                <button className="btn-back" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="btn-next" onClick={() => setStep(3)}>Tiếp theo →</button>
              </div>
            </div>
          )}

          {/* ===== BƯỚC 3: ĐỊA CHỈ & GHI CHÚ ===== */}
          {step === 3 && (
            <div className="step-content">
              <h2>Thông tin giao hàng</h2>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Dịch vụ</span>
                  <strong>{template?.templateName}</strong>
                </div>
                <div className="summary-row">
                  <span>Số ảnh</span>
                  <strong>{photos.length} ảnh</strong>
                </div>
                <div className="summary-row total-row">
                  <span>Tổng cộng</span>
                  <strong className="highlight">{Number(totalPrice).toLocaleString('vi-VN')}đ</strong>
                </div>
              </div>

              <div className="address-field">
                <label>Địa chỉ giao hàng <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  rows={3}
                />
              </div>

              <div className="address-field">
                <label>Ghi chú cho đơn hàng</label>
                <textarea
                  value={noteToAdmin}
                  onChange={e => setNoteToAdmin(e.target.value)}
                  placeholder="Yêu cầu đặc biệt, hướng dẫn in ảnh... (không bắt buộc)"
                  rows={2}
                />
              </div>

              <div className="step-actions">
                <button className="btn-back" onClick={() => setStep(2)}>← Quay lại</button>
                <button className="btn-next" onClick={handleStep3Next}>Tiếp theo →</button>
              </div>
            </div>
          )}

          {/* ===== BƯỚC 4: THANH TOÁN ===== */}
          {step === 4 && (
            <div className="step-content">
              <h2>Phương thức thanh toán</h2>

              <p className="step-subtitle">
                Tổng đơn hàng:{' '}
                <strong className="highlight">
                  {Number(totalPrice).toLocaleString('vi-VN')}đ
                </strong>
              </p>

              <div className="payment-options">

                <div
                  className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <span className="payment-icon">
                    <Icon icon="twemoji:money-with-wings" width="24" />
                  </span>
                  <div>
                    <strong>Thanh toán khi nhận hàng (COD)</strong>
                    <p>Trả tiền mặt khi nhận được sản phẩm</p>
                  </div>
                </div>

                <div
                  className={`payment-option ${paymentMethod === 'VNPay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('VNPay')}
                >
                  <span className="payment-icon">
                    <img
                      src="/images/logo/vnpay.png"
                      alt="VNPay"
                      style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                    />
                  </span>
                  <div>
                    <strong>Thanh toán qua VNPay</strong>
                    <p>Quét mã QR để thanh toán nhanh chóng</p>
                  </div>
                </div>

              </div>

              {paymentMethod === 'VNPay' && (
                <div className="vnpay-notice">
                  <Icon icon="twemoji:light-bulb" width="18" style={{ marginRight: '6px' }} />
                  Sau khi xác nhận, bạn sẽ được chuyển đến trang QR để hoàn tất thanh toán.
                </div>
              )}

              <div className="step-actions">
                <button className="btn-back" onClick={() => setStep(3)}>
                  ← Quay lại
                </button>

                <button
                  className="btn-confirm"
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? (
                    'Đang xử lý...'
                  ) : paymentMethod === 'VNPay' ? (
                    <>Tiếp tục thanh toán VNPay →</>
                  ) : (
                    <>
                      <Icon icon="twemoji:check-mark-button" width="18" style={{ marginRight: '6px' }} />
                      Đặt hàng ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ===== BƯỚC 5: THÀNH CÔNG (COD) ===== */}
          {step === 5 && (
            <div className="step-content success-screen">
              <div className="success-icon">
                <Icon icon="twemoji:party-popper" width="40" />
              </div>
              <h2>Đặt hàng thành công!</h2>
              <p>
                Đơn hàng <strong>#{draftOrderId}</strong> của bạn đã được ghi nhận.<br />
                Chúng tôi sẽ xử lý trong thời gian sớm nhất.
              </p>
              <div className="step-actions">
                <button className="btn-back" onClick={() => navigate('/')}>Về trang chủ</button>
                <button className="btn-next" onClick={() => navigate('/orders')}>Xem đơn hàng →</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default OrderNew;