import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

import { useOutletContext } from 'react-router-dom';

function Profile() {
  const raw = JSON.parse(localStorage.getItem('user') || '{}');
  const custId = raw.custId || raw.CustId || raw.id || raw.Id;
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fName: '',
    lName: '',
    pNo: '',
    address: '',
    email: ''
  });

  const { showNotify } = useOutletContext();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getCustomerById(custId);
        const data = res?.data ?? res;
        setInfo(data);
        setForm({
          fName: data.fName || data.FName || '',
          lName: data.lName || data.LName || '',
          pNo: data.pNo || data.PNo || '',
          address: data.address || data.Address || '',
          email: data.email || data.Email || ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (custId) fetchProfile();
    else navigate('/auth/login');
  }, [custId, navigate]);

  const handleEdit = () => {
    setEditing(true);
    setSaved(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      fName: info.fName || info.FName || '',
      lName: info.lName || info.LName || '',
      pNo: info.pNo || info.PNo || '',
      address: info.address || info.Address || '',
      email: info.email || info.Email || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...info,
        fName: form.fName,
        lName: form.lName,
        pNo: form.pNo,
        address: form.address,
        email: form.email
      };
      await userService.updateCustomer(custId, updated);
      setInfo(updated);
      localStorage.setItem('user', JSON.stringify({ ...raw, ...form }));
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      showNotify('error', 'Không thể cập nhật thông tin, vui lòng thử lại.')
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px 0', color: '#aaa' }}>
      Đang tải thông tin...
    </div>
  );

  const displayFName = info?.fName || info?.FName || '';
  const displayLName = info?.lName || info?.LName || '';
  const displayEmail = info?.email || info?.Email || '';
  const displayPhone = info?.pNo || info?.PNo || '';
  const displayAddress = info?.address || info?.Address || '';

  return (
    <div style={{ minHeight: '80vh', background: '#f8f9fa', padding: '48px 16px' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
              Thông tin của tôi
            </h1>
            <p style={{ color: '#aaa', fontSize: '0.88rem', margin: '6px 0 0' }}>
              Quản lý thông tin cá nhân của bạn
            </p>
          </div>
          {saved && (
            <span style={{ color: '#27ae60', fontSize: '0.88rem', fontWeight: 600 }}>
              ✓ Đã lưu thành công!
            </span>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Header avatar */}
          <div style={{ background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', padding: '28px 32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700,
              border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0
            }}>
              {(info?.username || info?.Username || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>
                {info?.username || info?.Username}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                Khách hàng
              </p>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 32px' }}>
            {!editing ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '28px' }}>
                  <InfoRow icon="👤" label="Họ" value={displayLName || <span style={{ color: '#ccc' }}>Chưa cập nhật</span>} />
                  <InfoRow icon="👤" label="Tên" value={displayFName || <span style={{ color: '#ccc' }}>Chưa cập nhật</span>} />
                  <InfoRow icon="✉️" label="Email" value={displayEmail || <span style={{ color: '#ccc' }}>Chưa cập nhật</span>} />
                  <InfoRow icon="📞" label="Số điện thoại" value={displayPhone || <span style={{ color: '#ccc' }}>Chưa cập nhật</span>} />
                  <InfoRow icon="📍" label="Địa chỉ" value={displayAddress || <span style={{ color: '#ccc' }}>Chưa cập nhật</span>} />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleEdit} style={btnPrimaryStyle}>
                    ✏️ Chỉnh sửa thông tin
                  </button>
                  <button onClick={() => navigate(-1)} style={btnSecondaryStyle}>
                    Quay lại
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <FormField label="Họ" icon="👤" style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={form.lName}
                        onChange={e => setForm(f => ({ ...f, lName: e.target.value }))}
                        placeholder="Nguyễn"
                        style={inputStyle}
                      />
                    </FormField>
                    <FormField label="Tên" icon="👤" style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={form.fName}
                        onChange={e => setForm(f => ({ ...f, fName: e.target.value }))}
                        placeholder="Văn A"
                        style={inputStyle}
                      />
                    </FormField>
                  </div>

                  <FormField label="Email" icon="✉️">
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Nhập email"
                      style={inputStyle}
                    />
                  </FormField>

                  <FormField label="Số điện thoại" icon="📞">
                    <input
                      type="tel"
                      value={form.pNo}
                      onChange={e => setForm(f => ({ ...f, pNo: e.target.value }))}
                      placeholder="Nhập số điện thoại"
                      style={inputStyle}
                    />
                  </FormField>

                  <FormField label="Địa chỉ" icon="📍">
                    <textarea
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </FormField>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button type="submit" disabled={saving} style={{ ...btnPrimaryStyle, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                  </button>
                  <button type="button" onClick={handleCancel} style={btnSecondaryStyle}>
                    Huỷ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 0', borderBottom: '1px solid #f5f5f5' }}>
      <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#333', fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

function FormField({ icon, label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', fontWeight: 600, color: '#555', marginBottom: '8px' }}>
        <span>{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

const btnPrimaryStyle = {
  padding: '10px 24px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: '#fff', border: 'none', borderRadius: '9px',
  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
};

const btnSecondaryStyle = {
  padding: '10px 20px',
  background: '#f0f0f0', color: '#555',
  border: 'none', borderRadius: '9px',
  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e8e8e8',
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: '#333',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit'
};

export default Profile;