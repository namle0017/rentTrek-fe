import PropTypes from 'prop-types';
import OutdoorIcon from '@/components/OutdoorIcon';
import styles from './SearchFilterBar.module.css';

export default function SearchFilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  tabs = [],
  activeTab = '',
  onTabChange,
  filters = [],
  onReset,
  actions,
}) {
  const handleSearchInput = (e) => {
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const handleClearSearch = () => {
    if (onSearchChange) onSearchChange('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        {onSearchChange && (
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <OutdoorIcon name="search" size={15} />
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchInput}
              aria-label={searchPlaceholder}
            />
            {searchValue && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClearSearch}
                title="Xóa từ khóa"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <OutdoorIcon name="close" size={12} />
              </button>
            )}
          </div>
        )}

        {filters.length > 0 && (
          <div className={styles.filterDropdowns}>
            {filters.map((f) => (
              <div key={f.name} className={styles.dropdownField}>
                {f.label && <span className={styles.dropdownLabel}>{f.label}:</span>}
                <select
                  value={f.value ?? ''}
                  onChange={(e) => f.onChange && f.onChange(e.target.value)}
                  className={styles.selectControl}
                  aria-label={f.label || f.name}
                >
                  <option value="">Tất cả</option>
                  {f.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {onReset && (
          <button type="button" className={styles.resetBtn} onClick={onReset} title="Đặt lại bộ lọc">
            Đặt lại
          </button>
        )}

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {tabs.length > 0 && (
        <div className={styles.tabRow} role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.tabBtn} ${isActive ? styles.tabActive : ''}`}
                onClick={() => onTabChange && onTabChange(tab.value)}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`${styles.tabBadge} ${isActive ? styles.tabBadgeActive : ''}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

SearchFilterBar.propTypes = {
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      count: PropTypes.number,
    }),
  ),
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        }),
      ),
      onChange: PropTypes.func,
    }),
  ),
  onReset: PropTypes.func,
  actions: PropTypes.node,
};

