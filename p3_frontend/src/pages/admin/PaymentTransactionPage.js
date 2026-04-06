import React, { useEffect, useState } from 'react';
import Pagination from '../../components/Pagination';
import '../../styles/admin/Dashboard.css';
import '../../styles/admin/ProductPage.css';
import '../../styles/admin/OrderPage.css';

import { useOutletContext } from 'react-router-dom';
import adminService from '../../services/adminService';

import { Icon } from '@iconify/react';

function PaymentTransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { showNotify } = useOutletContext();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPaymentTransactions().catch(() => []);
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = transactions.filter(t =>
    !search ||
    String(t.id).includes(search) ||
    String(t.orderId).includes(search) ||
    (t.transactionId || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.paymentMethod || '').toLowerCase().includes(search.toLowerCase())
  );

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const vnd = v => (Number(v) || 0).toLocaleString('vi-VN') + ' ₫';

  if (loading) return (
    <div className="dash-loading"><div className="dash-spinner" /><p>Đang tải...</p></div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Giao dịch VNPay</h2>
          <p className="page-subtitle">Lịch sử giao dịch thanh toán qua VNPay</p>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h3>Danh sách giao dịch ({filtered.length})</h3>
          <input
            className="search-input"
            placeholder="Tìm theo ID, mã đơn, mã GD..."
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
                <th>Mã giao dịch</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Mã phản hồi</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map(t => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td>
                    <span className="order-id">#ORD-{String(t.orderId).padStart(4, '0')}</span>
                  </td>
                  <td style={{ fontSize: 12, color: '#555' }}>{t.transactionId || '—'}</td>
                  <td><strong className="money">{vnd(t.amount)}</strong></td>
                  <td>
                    <span className={`method-badge ${t.status === 'Success' ? 'cash' : 'card'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {t.status === 'Success'
                        ? <><Icon icon="mdi:check-circle" color="#16a34a" width={16} /> Thành công</>
                        : <><Icon icon="mdi:close-circle" color="#dc2626" width={16} /> Thất bại</>
                      }
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12,
                      color: t.responseCode === '00' ? '#16a34a' : '#dc2626',
                      fontWeight: 500
                    }}>
                      {t.responseCode || '—'}
                    </span>
                  </td>
                  <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="no-data">Chưa có giao dịch VNPay nào</td></tr>
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
    </div>
  );
}

export default PaymentTransactionPage;