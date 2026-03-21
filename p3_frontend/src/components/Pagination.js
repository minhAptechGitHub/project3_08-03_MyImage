import React from 'react';
import './Pagination.css';

export default function Pagination({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onChange,
  pageSizes = [10, 20, 50],
  maxPagesToShow = 7,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  function changePage(p) {
    if (p < 1 || p > totalPages) return;
    if (typeof onChange === 'function') onChange({ page: p, pageSize });
  }

  function changePageSize(e) {
    const newSize = Number(e.target.value);
    if (typeof onChange === 'function') onChange({ page: 1, pageSize: newSize });
  }

  if (totalItems === 0) return null;

  let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let end = start + maxPagesToShow - 1;
  if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxPagesToShow + 1); }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className={`pagination ${className}`}>
      <div className="pagination-left">
        <button className="pg-btn" onClick={() => changePage(1)} disabled={currentPage === 1}>«</button>
        <button className="pg-btn" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>‹ Prev</button>
      </div>

      <div className="pagination-pages">
        {start > 1 && <span className="dots">...</span>}
        {pages.map(p => (
          <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => changePage(p)}>{p}</button>
        ))}
        {end < totalPages && <span className="dots">...</span>}
      </div>

      <div className="pagination-right">
        <button className="pg-btn" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>Next ›</button>
        <button className="pg-btn" onClick={() => changePage(totalPages)} disabled={currentPage === totalPages}>»</button>
        <select className="page-size-select" value={pageSize} onChange={changePageSize}>
          {pageSizes.map(s => <option key={s} value={s}>{s} / trang</option>)}
        </select>
        <span className="summary">
          {((currentPage - 1) * pageSize + 1)}–{Math.min(currentPage * pageSize, totalItems)} / {totalItems}
        </span>
      </div>
    </div>
  );
}
