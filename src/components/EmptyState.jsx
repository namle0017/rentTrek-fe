export default function EmptyState({ message = 'Chưa có dữ liệu', children }) {
  return (
    <div className="state-box">
      <p>{message}</p>
      {children}
    </div>
  );
}
