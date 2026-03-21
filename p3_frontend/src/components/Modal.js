import React, { useEffect } from 'react';
import './Modal.css';

function Modal({
  isOpen,
  onClose,
  title = 'Thông báo',
  children,
  footer = null,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm = null,
  loading = false,
  confirmDisabled = false,
  size = 'medium',
  closeOnOverlay = true,
  showCloseIcon = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeOnOverlay && !loading ? onClose : undefined}>
      <div className={`modal-content modal-${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {showCloseIcon && (
            <button className="modal-close-btn" onClick={onClose} disabled={loading}>✕</button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer !== null ? (
          <div className="modal-footer">{footer}</div>
        ) : (
          <div className="modal-footer">
            <button className="modal-btn modal-cancel-btn" onClick={onClose} disabled={loading}>
              {cancelText}
            </button>
            {onConfirm && (
              <button
                className="modal-btn modal-confirm-btn"
                onClick={onConfirm}
                disabled={loading || confirmDisabled}
              >
                {loading ? 'Đang xử lý...' : confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;