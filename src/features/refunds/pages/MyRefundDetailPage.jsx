import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import { ORDER_TYPE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import RefundProgressCard from '../components/RefundProgressCard';
import { useRefundCase } from '../hooks/useRefundCases';
import { formatRefundCode } from '../utils/refundDisplay';
import styles from './MyRefundsPage.module.css';

/** Chi tiết một hồ sơ hoàn tiền: tiến độ, biên lai, nhập STK hoặc gửi lại yêu cầu. */
export default function MyRefundDetailPage() {
  const { refundCaseId } = useParams();
  const { data: refund } = useRefundCase(refundCaseId);

  const orderLink = refund
    ? refund.orderType === ORDER_TYPE.RENTAL
      ? ROUTES.RENTAL_ORDER_DETAIL(refund.orderId)
      : ROUTES.TRIP_BOOKING_DETAIL(refund.orderId)
    : null;

  return (
    <main className={styles.page}>
      <Breadcrumb
        items={[
          { label: 'Hoàn tiền của tôi', to: ROUTES.MY_REFUNDS },
          { label: formatRefundCode(refundCaseId) },
        ]}
      />
      <RefundProgressCard refundCaseId={refundCaseId} />
      {orderLink && (
        <Link className="btn btn-outline" to={orderLink}>
          Xem đơn {refund.orderCode}
        </Link>
      )}
    </main>
  );
}
