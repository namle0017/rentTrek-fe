import { Outlet, useLocation, useParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import RentalOrderToolbar from './components/RentalOrderToolbar';
import styles from './RentalFulfillmentLayout.module.css';

export default function RentalFulfillmentLayout() {
  const { orderCode = '' } = useParams();
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  // /ops/rentals/:step hoặc /ops/rentals/:orderCode/:step
  const step = segments.at(-1);

  return (
    <div className={styles.page}>
      <RentalOrderToolbar key={orderCode} orderCode={orderCode} step={step} />
      {orderCode ? (
        <Outlet key={`${orderCode}/${step}`} />
      ) : (
        <EmptyState message="Nhập mã đơn thuê ở ô tra cứu phía trên để bắt đầu." />
      )}
    </div>
  );
}
