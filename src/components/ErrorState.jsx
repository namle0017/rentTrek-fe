export default function ErrorState({ message = 'Đã có lỗi xảy ra', onRetry }) {
  return (
    <div className="state-box state-box--error">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
