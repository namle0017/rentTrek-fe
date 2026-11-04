import { Link, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { useGuideProvidedItems } from '../hooks/useGuidePortal';
import styles from './GuidePortal.module.css';

export default function GuideProvidedItemsPage() {
  const { tripId } = useParams();
  const { data, isLoading, isError, error, refetch } = useGuideProvidedItems(tripId);

  if (isLoading) return <Spinner />;
  if (isError || !data) return <ErrorState message={error?.message} onRetry={refetch} />;

  const items = data.items ?? [];

  return (
    <>
      <div className={styles.subNavRow}>
        <Link to={ROUTES.GUIDE_TRIP_GROUP(tripId)} className={styles.btnOutline}>
          ← Danh sách nhóm
        </Link>
        <Link to={ROUTES.GUIDE_ITINERARY(tripId)} className={styles.btnOutline}>
          Lịch trình
        </Link>
      </div>

      <div className={styles.tripCard}>
        <h1 className={styles.cardTitle}>Danh sách Đồ cấp Giao cho Đoàn</h1>
        <p className={styles.metaText}>
          Kiểm tra bàn giao thiết bị thực địa và mã tài sản vật lý (Asset Code) trước khi xuất phát.
        </p>
      </div>

      {items.length === 0 ? (
        <div className={styles.tripCard}>
          <p className={styles.metaText}>Chuyến đi này không có danh mục đồ cấp phát đi kèm.</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.providedItemId} className={styles.tripCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className={styles.cardTitle}>{item.productName}</h2>
                <p className={styles.metaText}>Phân loại: {item.variantName}</p>
              </div>
              <span
                className={`${styles.badge} ${
                  item.allocatedQuantity >= item.requiredQuantity ? styles.badgePositive : styles.badgeWarning
                }`}
              >
                Đã cấp {item.allocatedQuantity}/{item.requiredQuantity} ({item.status})
              </span>
            </div>

            {item.allocatedAssets && item.allocatedAssets.length > 0 && (
              <div className={styles.subNavRow}>
                {item.allocatedAssets.map((asset) => (
                  <span key={asset.assetCode} className={`${styles.badge} ${styles.badgePositive}`}>
                    Mã: {asset.assetCode} ({asset.status})
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}
