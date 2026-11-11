import { Link } from 'react-router-dom';
import styles from './Breadcrumb.module.css';

/**
 * Shared Breadcrumb component across RenTrekk.
 * Reference design: TourDetailPage breadcrumb.
 *
 * @param {Object} props
 * @param {Array<{ label: string, to?: string, isCurrent?: boolean }>} props.items - Breadcrumb items
 * @param {string} [props.separator='/'] - Separator between items
 * @param {boolean} [props.isLoading=false] - Whether dynamic data is still loading
 * @param {string} [props.className=''] - Optional custom class name for container
 * @param {string} [props.ariaLabel='Breadcrumb'] - Accessibility label for the nav element
 */
export default function Breadcrumb({
  items = [],
  separator = '/',
  isLoading = false,
  className = '',
  ariaLabel = 'Breadcrumb',
}) {
  const validItems = items.filter(Boolean);

  if (!validItems.length && !isLoading) {
    return null;
  }

  return (
    <nav className={`${styles.breadcrumbNav} ${className}`.trim()} aria-label={ariaLabel}>
      <ol className={styles.breadcrumbList}>
        {validItems.map((item, index) => {
          const isLast = index === validItems.length - 1;
          const isCurrent = item.isCurrent || (isLast && !item.to);

          return (
            <li
              key={`${item.label || index}-${index}`}
              className={`${styles.breadcrumbItem} ${isCurrent ? styles.current : ''}`}
            >
              {index > 0 && (
                <span className={styles.separator} aria-hidden="true">
                  {separator}
                </span>
              )}

              {isCurrent ? (
                <span
                  className={styles.currentLabel}
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : item.to ? (
                <Link to={item.to} className={styles.link} title={item.label}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.label} title={item.label}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}

        {isLoading && (
          <li className={styles.breadcrumbItem}>
            {validItems.length > 0 && (
              <span className={styles.separator} aria-hidden="true">
                {separator}
              </span>
            )}
            <span className={styles.skeleton} aria-hidden="true" />
          </li>
        )}
      </ol>
    </nav>
  );
}

