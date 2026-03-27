import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

/**
 * VNPay callback page.
 * VNPay redirects the browser here after payment:
 *   /VnPay/callback?vnp_ResponseCode=00&vnp_TxnRef=5&...
 *
 * This page forwards all query params to the backend for signature validation
 * and then shows the result to the customer.
 */
function VnPayCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'fail'
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        // Forward ALL query params to backend for validation
        const queryString = searchParams.toString();
        const result = await userService.confirmVnPayCallback(queryString);

        if (result.success) {
          setStatus('success');
          setOrderId(result.orderId);
          setMessage(result.message || 'Thanh toán thành công!');
        } else {
          setStatus('fail');
          setMessage(result.message || 'Thanh toán thất bại hoặc đã bị huỷ.');
          setOrderId(result.orderId);
        }
      } catch (err) {
        console.error('VNPay callback error:', err);
        setStatus('fail');
        setMessage('Không thể xác minh giao dịch. Vui lòng liên hệ hỗ trợ.');
      }
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.label}>Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          {status === 'success' ? '🎉' : '❌'}
        </div>
        <h2 style={{ color: status === 'success' ? '#22c55e' : '#ef4444', marginBottom: 8 }}>
          {status === 'success' ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h2>
        {orderId && (
          <p style={{ color: '#94a3b8', marginBottom: 8 }}>
            Đơn hàng: <strong style={{ color: '#e2e8f0' }}>#{orderId}</strong>
          </p>
        )}
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={styles.btnSecondary} onClick={() => navigate('/')}>
            Về trang chủ
          </button>
          <button style={styles.btnPrimary} onClick={() => navigate('/orders')}>
            Xem đơn hàng →
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 16,
    padding: '48px 40px',
    textAlign: 'center',
    maxWidth: 420,
    width: '100%',
    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
  },
  spinner: {
    width: 48,
    height: 48,
    border: '4px solid #334155',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
  label: {
    color: '#94a3b8',
    fontSize: 16,
  },
  btnPrimary: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
  btnSecondary: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  },
};

export default VnPayCallback;
