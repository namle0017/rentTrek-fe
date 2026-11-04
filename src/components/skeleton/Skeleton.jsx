import styles from './Skeleton.module.css';

/**
 * Base Skeleton Component với hiệu ứng quét ánh sáng Shimmer
 * @param {string|number} width - Độ rộng (px, %, rem)
 * @param {string|number} height - Chiều cao (px, %, rem)
 * @param {'text'|'rectangular'|'rounded'|'circular'} variant - Dạng hiển thị
 * @param {string} className - Class tùy chỉnh
 * @param {object} style - Inline style tùy chỉnh
 */
export default function Skeleton({
  width = '100%',
  height = '1rem',
  variant = 'text',
  className = '',
  style = {},
}) {
  const variantClass = styles[variant] || styles.text;

  return (
    <span
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
