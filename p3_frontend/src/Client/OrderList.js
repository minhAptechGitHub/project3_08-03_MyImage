import { useState, useEffect } from "react";
import apiService from "../Admin/Services";
import './OrderList.css';

function OrderList({ user }) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrder();
    }, [user]);

    const fetchOrder = async () => {
        try {
            const result = await apiService.orders.getByCustomer(user.custId);
            setOrders(result);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const statusClass = (status) => {
        const map = {
            'Pending': 'status-pending',
            'Payment Verified': 'status-verified',
            'Processing': 'status-processing',
            'Printed': 'status-printed',
            'Shipped': 'status-shipped',
            'Completed': 'status-completed',
            'Cancelled': 'status-cancelled',
        };
        return map[status] || 'status-pending';
    };

    return (
        <div>
            <h2 className="section-title">Your Orders</h2>
            <p className="section-description">Track your print orders below.</p>

            {orders.length === 0 ? (
                <p className="no-data">No orders yet.</p>
            ) : (
                orders.map(order => (
                    <div key={order.orderId} className="order-card">

                        {/* ── Order Header ── */}
                        <div className="order-card-header">
                            <div className="order-card-meta">
                                <span className="order-card-id">Order #{order.orderId}</span>
                                <span className="order-card-date">
                                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <span className={`status-badge ${statusClass(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        {/* ── Order Details Table ── */}
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Detail ID</th>
                                        <th>Photo</th>
                                        <th>File</th>
                                        <th>Size</th>
                                        <th>Qty</th>
                                        <th>Price/Copy</th>
                                        <th>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.orderDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="no-data">No items in this order.</td>
                                        </tr>
                                    ) : (
                                        order.orderDetails.map(od => (
                                            <tr key={od.orderDetailId}>
                                                <td>{od.orderDetailId}</td>
                                                <td style={{ textAlign: 'center', width: '80px', padding: '5px' }}>
                                                    {od.photo && od.photo.filePath ? (
                                                        <img
                                                            // Dùng encodeURI để xử lý các ký tự tiếng Việt/khoảng trắng trong tên file
                                                            src={encodeURI(`http://localhost:5002/${od.photo.filePath}`)}
                                                            alt="Thumb"
                                                            style={{
                                                                width: '120px',
                                                                height: '90px',
                                                                objectFit: 'cover',
                                                                borderRadius: '5px',
                                                                border: '1px solid #eee',
                                                                display: 'block',
                                                                margin: '0 auto'
                                                            }}
                                                            onError={(e) => {
                                                                // Quan trọng: Gỡ bỏ onError sau khi chạy lần đầu để tránh vòng lặp giật giật
                                                                e.target.onerror = null;
                                                                e.target.src = "https://via.placeholder.com/60?text=No+Img";
                                                            }}
                                                        />
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </td>
                                                <td>
                                                    <a
                                                        href={`http://localhost:5002/${od.photo.filePath}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="photo-link"
                                                    >
                                                        {od.photo.fileName}
                                                    </a>
                                                </td>
                                                <td>{od.size.sizeName}</td>
                                                <td>{od.quantity}</td>
                                                <td>{od.pricePerCopy.toLocaleString()} VND</td>
                                                <td>{od.lineTotal.toLocaleString()} VND</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Order Footer ── */}
                        <div className="order-card-footer">
                            <span className="order-total-label">Order Total</span>
                            <span className="order-total-value">{order.totalPrice.toLocaleString()} VND</span>
                        </div>

                    </div>
                ))
            )}
        </div>
    );
}

export default OrderList;