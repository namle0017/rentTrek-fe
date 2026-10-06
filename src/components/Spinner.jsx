export default function Spinner({ fullScreen = false }) {
  return (
    <div className={fullScreen ? 'spinner-wrapper spinner-wrapper--full' : 'spinner-wrapper'}>
      <span className="spinner" role="status" aria-label="Đang tải" />
    </div>
  );
}
