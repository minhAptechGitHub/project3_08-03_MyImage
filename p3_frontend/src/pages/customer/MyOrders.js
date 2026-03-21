import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import '../../styles/customer/myOrders.css';

const STATUS_MAP = {
  'Pending':          { label: 'Chờ xác nhận',   color: 'status-pending' },
  'Payment Verified': { label: 'Đã xác nhận TT', color: 'status-verified' },
  'Processing':       { label: 'Đang xử lý',      color: 'status-processing' },
  'Printed':          { label: 'Đã in xong',       color: 'status-printed' },
  'Shipped':          { label: 'Đang giao hàng',  color: 'status-shipped' },
  'Completed':        { label: 'Hoàn thành',       color: 'status-completed' },
  'Cancelled':        { label: 'Đã huỷ',           color: 'status-cancelled' },
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const raw = JSON.parse(localStorage.getItem('user') || '{}');
  const user = {
    ...raw,
    custId: raw.custId || raw.CustId || raw.id || raw.Id
  };

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
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedId(prev => prev === orderId ? null : orderId);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn huỷ đơn hàng này không?')) return;
    try {
      await userService.cancelOrder(orderId);
      setOrders(prev =>
        prev.map(o => o.orderId === orderId ? { ...o, status: 'Cancelled' } : o)
      );
    } catch (err) {
      console.error('Lỗi huỷ đơn:', err);
      alert('Không thể huỷ đơn hàng, vui lòng thử lại.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="orders-loading">Đang tải đơn hàng...</div>;

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>Đơn hàng của tôi</h1>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Hãy khám phá dịch vụ in ảnh của chúng tôi!</p>
            <button className="btn-new-order" onClick={() => navigate('/')}>
              Xem dịch vụ
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const status = STATUS_MAP[order.status] || { label: order.status, color: 'status-pending' };
              const isOpen = expandedId === order.orderId;
              const sharedNote = order.orderDetails?.find(item => item.noteToAdmin)?.noteToAdmin;

              return (
                <div key={order.orderId} className={`order-item ${isOpen ? 'open' : ''}`}>

                  {/* Header đơn hàng */}
                  <div className="order-head" onClick={() => toggleExpand(order.orderId)}>
                    <div className="order-head-left">
                      <span className="order-id">Đơn #{order.orderId}</span>
                      <span className="order-date">{formatDate(order.orderDate)}</span>
                    </div>
                    <div className="order-head-right">
                      <span className={`status-badge ${status.color}`}>{status.label}</span>
                      <span className="order-total">
                        {Number(order.totalPrice).toLocaleString('vi-VN')}đ
                      </span>
                      <span className="expand-icon">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Chi tiết đơn hàng */}
                  {isOpen && (
                    <div className="order-detail">
                      <div className="detail-meta">
                        <span>📍 {order.shippingAddress}</span>
                      </div>

                      {sharedNote && (
                        <p className="detail-note">
                          💬 Ghi chú: <em>{sharedNote}</em>
                        </p>
                      )}

                      {order.orderDetails?.length > 0 ? (
                        <div className="detail-items">
                          {order.orderDetails.map((item, i) => (
                            <div key={i} className="detail-item">
                              <div className="detail-photo">
                                <img
                                  src={`http://localhost:5002/${item.photo?.filePath}`}
                                  alt={item.photo?.fileName || 'ảnh'}
                                  onError={e => { e.target.src = '/images/placeholder.png'; }}
                                />
                              </div>
                              <div className="detail-info">
                                <p className="detail-filename">{item.photo?.fileName || 'Ảnh không xác định'}</p>
                                <p className="detail-size">
                                  Kích thước: <strong>{item.size?.sizeName || 'Theo yêu cầu'}</strong>
                                </p>
                                <p className="detail-qty">Số lượng: <strong>{item.quantity} bản</strong></p>
                                <p className="detail-price">
                                  {Number(item.pricePerCopy).toLocaleString('vi-VN')}đ × {item.quantity} =&nbsp;
                                  <strong className="line-total">{Number(item.lineTotal).toLocaleString('vi-VN')}đ</strong>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-detail">Chưa có ảnh trong đơn này.</p>
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
                        <span>Tổng cộng:</span>
                        <strong className="total-price">
                          {Number(order.totalPrice).toLocaleString('vi-VN')}đ
                        </strong>
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