import React from 'react';
import './ActionButton.css';

function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onCustom,
  viewText = 'Xem',
  editText = 'Sửa',
  deleteText = 'Xóa',
  customText = 'Khác',
  showView = true,
  showEdit = true,
  showDelete = true,
  showCustom = false,
  size = 'small',
}) {
  return (
    <div className={`action-buttons action-${size}`}>
      {showView && onView && (
        <button className="btn btn-view" onClick={onView}>{viewText}</button>
      )}
      {showEdit && onEdit && (
        <button className="btn btn-edit" onClick={onEdit}>{editText}</button>
      )}
      {showDelete && onDelete && (
        <button className="btn btn-delete" onClick={() => {
          if (window.confirm('Bạn có chắc muốn xóa không?')) onDelete();
        }}>{deleteText}</button>
      )}
      {showCustom && onCustom && (
        <button className="btn btn-custom" onClick={onCustom}>⚙ {customText}</button>
      )}
    </div>
  );
}

export default ActionButtons;
