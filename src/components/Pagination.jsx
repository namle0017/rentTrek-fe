/** Nhận trực tiếp các field của PagedResult từ BE. */
export default function Pagination({ pageNumber, totalPages, hasPrevious, hasNext, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="btn btn-outline"
        disabled={!hasPrevious}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        Trước
      </button>
      <span>
        Trang {pageNumber} / {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-outline"
        disabled={!hasNext}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Sau
      </button>
    </nav>
  );
}
