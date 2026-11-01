import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { ORDER_PAYMENT_STATUS_LABEL, ORDER_STATUS_LABEL, ORDER_TYPE, ORDER_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { useMyOrders } from '../hooks/useOrders';
import styles from './MyOrdersPage.module.css';

const TABS = [
  { label: 'Tất cả', orderType: undefined },
  { label: 'Tour', orderType: ORDER_TYPE.TRIP_BOOKING },
  { label: 'Thuê thiết bị', orderType: ORDER_TYPE.RENTAL },
];

function OrderCard({ order }) {
  const content = (
    <>
      <div className={styles.cardMain}>
        <span className={styles.type}>{ORDER_TYPE_LABEL[order.orderType] || order.orderType}</span>
        <strong>{order.title}</strong>
        <small>
          {order.orderCode}
          {order.serviceStartAt && ` · ${formatDateTime(order.serviceStartAt)}`}
        </small>
      </div>
      <div className={styles.cardSide}>
        <span className={styles.status}>{ORDER_STATUS_LABEL[order.status] || order.status}</span>
        {order.paymentStatus && (
          <small>{ORDER_PAYMENT_STATUS_LABEL[order.paymentStatus] || order.paymentStatus}</small>
        )}
        {order.totalPayable > 0 && <b>{formatCurrency(order.totalPayable)}</b>}
      </div>
    </>
  );

  // ponytail: đơn thuê chưa có trang chi tiết, thêm Link khi có route RENTAL_ORDER_DETAIL
  if (order.orderType !== ORDER_TYPE.TRIP_BOOKING) return <article className={styles.card}>{content}</article>;
  return (
    <Link className={styles.card} to={ROUTES.TRIP_BOOKING_DETAIL(order.id)}>
      {content}
    </Link>
  );
}

export default function MyOrdersPage() {
  const [orderType, setOrderType] = useState(undefined);
  const [pageNumber, setPageNumber] = useState(1);
  const { data, isLoading, isError, error, refetch } = useMyOrders({ pageNumber, pageSize: 10, orderType });

  const selectTab = (nextType) => {
    setOrderType(nextType);
    setPageNumber(1);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.kicker}>TÀI KHOẢN</span>
        <h1>Đơn của tôi</h1>
      </header>

      <div className={styles.tabs} role="group" aria-label="Lọc loại đơn">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            aria-pressed={orderType === tab.orderType}
            onClick={() => selectTab(tab.orderType)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message={error?.message || 'Không thể tải đơn hàng.'} onRetry={refetch} />}
      {data?.items.length === 0 && <EmptyState message="Chưa có đơn nào." />}
      {data?.items.length > 0 && (
        <>
          <div className={styles.list}>
            {data.items.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination {...data} onPageChange={setPageNumber} />
        </>
      )}
    </main>
  );
}
