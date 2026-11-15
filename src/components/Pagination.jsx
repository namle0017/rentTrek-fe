/** Nhận trực tiếp các field của PagedResult từ BE hoặc tính toán fallback. */
export default function Pagination({
  pageNumber,
  page,
  totalPages = 1,
  hasPrevious,
  hasNext,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}) {
  const current = pageNumber || page || 1;
  const canPrev = hasPrevious !== undefined ? hasPrevious : current > 1;
  const canNext = hasNext !== undefined ? hasNext : current < totalPages;

  if (totalPages <= 1 && !totalItems && !pageSize) return null;

  const startItem = totalItems ? (current - 1) * (pageSize || 10) + 1 : null;
  const endItem = totalItems ? Math.min(current * (pageSize || 10), totalItems) : null;

  return (
    <nav className="pagination" aria-label="Phân trang" style={{ display: 'flex', alignItems: 'center', justifyContent: totalItems ? 'space-between' : 'flex-end', gap: 12, flexWrap: 'wrap' }}>
      {totalItems !== undefined && (
        <div style={{ fontSize: 'var(--font-size-meta, 12px)', color: '#64748b' }}>
          Hiển thị <strong>{totalItems === 0 ? 0 : startItem}–{endItem}</strong> trên <strong>{totalItems}</strong> kết quả
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {pageSize && onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-meta, 12px)' }}>
            <label htmlFor="pagination-page-size" style={{ color: '#64748b' }}>
              Hiển thị:
            </label>
            <select
              id="pagination-page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                height: 32,
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                padding: '0 6px',
                fontSize: 12,
              }}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!canPrev}
              onClick={() => onPageChange(current - 1)}
            >
              Trước
            </button>
            <span style={{ fontSize: 'var(--font-size-control, 13px)', color: '#475569' }}>
              Trang {current} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!canNext}
              onClick={() => onPageChange(current + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
