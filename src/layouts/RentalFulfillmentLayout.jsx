import { Outlet, useLocation, useParams } from 'react-router-dom';
import FulfillmentWorklist from './components/FulfillmentWorklist';
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
        // Chưa chọn đơn: hiện danh sách đơn cần xử lý ở bước này
        <FulfillmentWorklist step={step} />
      )}
    </div>
  );
}
