import { Outlet, useLocation, useParams } from 'react-router-dom';
import RentalOrderToolbar from './components/RentalOrderToolbar';
import styles from './RentalFulfillmentLayout.module.css';

export default function RentalFulfillmentLayout() {
  const { orderCode = 'RT-202611-001' } = useParams();
  const { pathname } = useLocation();
  const step = pathname.split('/').at(-1);

  return (
    <div className={styles.page}>
      <RentalOrderToolbar key={orderCode} orderCode={orderCode} step={step} />
      <Outlet key={`${orderCode}/${step}`} />
    </div>
  );
}
