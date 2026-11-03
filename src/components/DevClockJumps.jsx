/**
 * Nút tua nhanh đồng hồ giả lập tới các mốc của một chuyến / đơn thuê (chỉ dùng khi dev).
 * `targets`: [{ label, at }] với `at` là ISO string. Không gọi API — trang truyền `onJump`.
 */
export default function DevClockJumps({ targets, onJump, onReset, isSimulated, isPending }) {
  return (
    <section className="dev-clock-jumps" aria-label="Tua thời gian để test">
      <p className="dev-clock-jumps__title">⏱ Tua thời gian để test (Development)</p>
      <div className="dev-clock-jumps__buttons">
        {targets.map((target) => (
          <button key={target.label} type="button" disabled={isPending} onClick={() => onJump(target.at)}>
            {target.label}
          </button>
        ))}
        {isSimulated && (
          <button type="button" disabled={isPending} onClick={onReset}>
            Về giờ thật
          </button>
        )}
      </div>
    </section>
  );
}
