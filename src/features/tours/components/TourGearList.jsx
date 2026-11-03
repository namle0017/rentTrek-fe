import styles from './TourGearList.module.css';

export default function TourGearList({ providedItems = [], preparationItems = [] }) {
  return (
    <div className={styles.gearContainer}>
      {/* Cột 1: TrekRent cung cấp */}
      <div className={styles.gearBox}>
        <div className={`${styles.boxHeader} ${styles.boxHeaderProvided}`}>TrekRent chuẩn bị</div>
        <ul className={styles.itemList}>
          {providedItems.length > 0 ? (
            providedItems.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">
                  ✓
                </span>
                <div className={styles.itemContent}>
                  <div className={styles.itemName}>{item.itemName}</div>
                  {item.note && <div className={styles.itemNote}>{item.note}</div>}
                </div>
              </li>
            ))
          ) : (
            <li className="text-muted">Đang cập nhật danh mục trang bị...</li>
          )}
        </ul>
      </div>

      {/* Cột 2: Bạn cần tự chuẩn bị */}
      <div className={styles.gearBox}>
        <div className={`${styles.boxHeader} ${styles.boxHeaderPrepared}`}>Bạn cần chuẩn bị</div>
        <ul className={styles.itemList}>
          {preparationItems.length > 0 ? (
            preparationItems.map((item) => (
              <li key={item.id} className={styles.item}>
                <span className={styles.itemIcon} aria-hidden="true">
                  ○
                </span>
                <div className={styles.itemContent}>
                  <div className={styles.itemName}>
                    {item.itemName}
                    {item.isMandatory && <span className={styles.mandatoryBadge}>Bắt buộc</span>}
                  </div>
                  {item.note && <div className={styles.itemNote}>{item.note}</div>}
                </div>
              </li>
            ))
          ) : (
            <li className="text-muted">Đang cập nhật danh mục chuẩn bị...</li>
          )}
        </ul>
      </div>
    </div>
  );
}
