import styles from '../AdminPolicies.module.css';

/**
 * Biểu đồ bậc thang SVG dùng chung.
 * steps: [{ label, value }] đã sắp theo thứ tự hiển thị (trái → phải).
 * Mỗi bậc là một cột có giá trị phần trăm (0..max).
 */
export default function StepChart({ steps, max = 100, unit = '%', compact = false, ariaLabel }) {
  const data = (steps ?? []).filter((step) => Number.isFinite(step.value));
  if (data.length === 0) {
    return <div className={styles.chartEmpty}>Chưa có dữ liệu để vẽ biểu đồ</div>;
  }

  const width = 600;
  const height = compact ? 150 : 230;
  const pad = { top: 26, right: 16, bottom: 40, left: 36 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const colW = plotW / data.length;
  const yOf = (value) => pad.top + plotH - (Math.min(Math.max(value, 0), max) / max) * plotH;

  let path = '';
  data.forEach((step, index) => {
    const x0 = pad.left + index * colW;
    const x1 = x0 + colW;
    const y = yOf(step.value);
    path += index === 0 ? `M${x0},${y}` : `L${x0},${y}`;
    path += `L${x1},${y}`;
  });

  return (
    <figure className={styles.chartFigure}>
      <svg
        className={styles.chartSvg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel ?? 'Biểu đồ bậc thang'}
      >
        {[0, 50, 100].map((tick) => {
          const y = yOf((tick / 100) * max);
          return (
            <g key={tick}>
              <line className={styles.chartGrid} x1={pad.left} x2={width - pad.right} y1={y} y2={y} />
              <text className={styles.chartTick} x={pad.left - 6} y={y + 4} textAnchor="end">
                {Math.round((tick / 100) * max)}
                {unit}
              </text>
            </g>
          );
        })}
        <line
          className={styles.chartAxis}
          x1={pad.left}
          x2={width - pad.right}
          y1={pad.top + plotH}
          y2={pad.top + plotH}
        />
        {data.map((step, index) => {
          const x = pad.left + index * colW;
          const y = yOf(step.value);
          return (
            <g key={`${step.label}-${index}`}>
              <rect
                className={styles.chartBar}
                x={x + 2}
                y={y}
                width={Math.max(colW - 4, 1)}
                height={pad.top + plotH - y}
                rx="3"
                fillOpacity="0.9"
              />
              <text className={styles.chartValue} x={x + colW / 2} y={Math.max(y - 6, 12)} textAnchor="middle">
                {step.value}
                {unit}
              </text>
              <text className={styles.chartLabel} x={x + colW / 2} y={height - 18} textAnchor="middle">
                {step.label}
              </text>
            </g>
          );
        })}
        <path className={styles.chartLine} d={path} />
      </svg>
    </figure>
  );
}
