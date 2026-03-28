import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import '../../styles/customer/myOrders.css';

import { useOutletContext } from 'react-router-dom';
import { Icon } from '@iconify/react';

const STATUS_MAP = {
  'Pending': { label: 'Chờ xác nhận', color: 'status-pending' },
  'Payment Verified': { label: 'Đã xác nhận TT', color: 'status-verified' },
  'Processing': { label: 'Đang xử lý', color: 'status-processing' },
  'Printed': { label: 'Đã in xong', color: 'status-printed' },
  'Shipped': { label: 'Đang giao hàng', color: 'status-shipped' },
  'Completed': { label: 'Hoàn thành', color: 'status-completed' },
  'Cancelled': { label: 'Đã huỷ', color: 'status-cancelled' },
};

const isCustomOrder = (order) =>
  Number(order.totalPrice) === 0 &&
  order.orderDetails?.some(d => d.size === null || d.size === undefined);

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  // Lấy thông tin user từ localStorage (an toàn hơn)
  const raw = JSON.parse(localStorage.getItem('user') || '{}');
  const user = {
    ...raw,
    custId: raw.custId || raw.CustId || raw.id || raw.Id
  };

  const { showNotify } = useOutletContext();

  useEffect(() => {
    if (!user.custId) {
      navigate('/auth/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await userService.getMyOrders(user.custId);
        setOrders(data || []);
      } catch (err) {
        console.error('Lỗi tải đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user.custId, navigate]);

  const toggleExpand = (orderId) => {
    setExpandedId(prev => prev === orderId ? null : orderId);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn huỷ đơn hàng này không?')) return;

    try {
      await userService.cancelOrder(orderId);
      setOrders(prev =>
        prev.map(o =>
          o.orderId === orderId ? { ...o, status: 'Cancelled' } : o
        )
      );
    } catch (err) {
      console.error('Lỗi huỷ đơn:', err);
      showNotify('error', 'Không thể huỷ đơn hàng, vui lòng thử lại.')
    }
  };

  // Format ngày giờ theo múi giờ Việt Nam (tốt hơn)
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';

    const d = new Date(
      dateStr.includes('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    );

    return d.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="orders-loading">Đang tải đơn hàng...</div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>Đơn hàng của tôi</h1>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">
              <Icon icon="twemoji:package" width="48" />
            </div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Hãy khám phá dịch vụ in ảnh của chúng tôi!</p>
            <button
              className="btn-new-order"
              onClick={() => navigate('/')}
            >
              Xem dịch vụ
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const status = STATUS_MAP[order.status] || {
                label: order.status || 'Không xác định',
                color: 'status-pending'
              };

              const isOpen = expandedId === order.orderId;
              const custom = isCustomOrder(order);
              const sharedNote = order.orderDetails?.find(item => item.noteToAdmin)?.noteToAdmin;

              return (
                <div
                  key={order.orderId}
                  className={`order-item ${isOpen ? 'open' : ''}`}
                >
                  {/* Header đơn hàng */}
                  <div
                    className="order-head"
                    onClick={() => toggleExpand(order.orderId)}
                  >
                    <div className="order-head-left">
                      <span className="order-id">Đơn #{order.orderId}</span>
                      <span className="order-date">{formatDate(order.orderDate)}</span>
                      {custom && (
                        <span className="order-type-badge">In theo yêu cầu</span>
                      )}
                    </div>

                    <div className="order-head-right">
                      <span className={`status-badge ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="order-total">
                        {isOpen
                          ? null
                          : custom
                            ? 'Chờ báo giá'
                            : `${Number(order.totalPrice || 0).toLocaleString('vi-VN')}đ`
                        }
                      </span>
                      <span className="expand-icon">
                        <Icon icon={isOpen ? 'twemoji:upwards-button' : 'twemoji:downwards-button'} />
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết đơn hàng */}
                  {isOpen && (
                    <div className="order-detail">
                      <div className="detail-meta">
                        <span>
                          <Icon icon="twemoji:round-pushpin" style={{ marginRight: '4px' }} />
                          {order.shippingAddress || 'Chưa có địa chỉ'}
                        </span>
                      </div>

                      {sharedNote && (
                        <p className="detail-note">
                          <Icon icon="twemoji:speech-balloon" style={{ marginRight: '4px' }} />
                          Yêu cầu in: <em>{sharedNote}</em>
                        </p>
                      )}

                      {/* ĐƠN IN THEO YÊU CẦU */}
                      {custom ? (
                        <div className="custom-order-notice">
                          <div className="notice-icon">
                            <Icon icon="twemoji:telephone-receiver" width="28" />
                          </div>
                          <div className="notice-body">
                            <strong>Đơn in theo yêu cầu</strong>
                            <p>
                              Chúng tôi đã nhận được {order.orderDetails?.length || 0} file ảnh của bạn.
                              Nhân viên sẽ liên hệ sớm nhất để tư vấn và báo giá chi tiết.
                            </p>
                            <p className="notice-contact">
                              <Icon icon="twemoji:e-mail" style={{ marginRight: '4px' }} />
                              Liên hệ: <strong>support@myimage.vn</strong>
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* ĐƠN THÔNG THƯỜNG */
                        order.orderDetails?.length > 0 ? (
                          <div className="detail-items">
                            {order.orderDetails.map((item, i) => (
                              <div key={i} className="detail-item">
                                <img
                                  src={
                                    item.photo?.filePath
                                      ? `http://localhost:5002/${item.photo.filePath}`
                                      : 'https://placehold.co/80x80?text=No+Image'
                                  }
                                  alt={item.photo?.fileName || 'Không có ảnh'}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '1px solid #ddd'
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/80x80?text=No+Image';
                                  }}
                                />
                                <div className="detail-info">
                                  <p className="detail-filename">
                                    {item.photo?.fileName || 'Ảnh không xác định'}
                                  </p>
                                  <p className="detail-size">
                                    Kích thước: <strong>{item.size?.sizeName || '—'}</strong>
                                  </p>
                                  <p className="detail-qty">
                                    Số lượng: <strong>{item.quantity} bản</strong>
                                  </p>
                                  <p className="detail-price">
                                    {Number(item.pricePerCopy || 0).toLocaleString('vi-VN')}đ × {item.quantity} =&nbsp;
                                    <strong className="line-total">
                                      {Number(item.lineTotal || 0).toLocaleString('vi-VN')}đ
                                    </strong>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-detail">Chưa có ảnh trong đơn này.</p>
                        )
                      )}

                      <div className="detail-footer">
                        {order.status === 'Pending' && (
                          <button
                            className="btn-cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(order.orderId);
                            }}
                          >
                            Huỷ đơn hàng
                          </button>
                        )}
                        <span style={{ flex: 1 }} />

                        {!custom && (
                          <>
                            <span>Tổng cộng:</span>
                            <strong className="total-price">
                              {Number(order.totalPrice || 0).toLocaleString('vi-VN')}đ
                            </strong>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;