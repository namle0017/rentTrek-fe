/** Nhận trực tiếp các field của PagedResult từ BE hoặc tính toán fallback. */
export default function Pagination({ pageNumber, page, totalPages = 1, hasPrevious, hasNext, onPageChange }) {
  const current = pageNumber || page || 1;
  const canPrev = hasPrevious !== undefined ? hasPrevious : current > 1;
  const canNext = hasNext !== undefined ? hasNext : current < totalPages;

  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="btn btn-outline"
        disabled={!canPrev}
        onClick={() => onPageChange(current - 1)}
      >
        Trước
      </button>
      <span>
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
    </nav>
  );
}
