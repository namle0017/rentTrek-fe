import { useQueries } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/formatDate';
import styles from './FulfillmentWorklist.module.css';

const PAGE_SIZE = 100;

const fetchOrders = (status) =>
  axiosClient
    .get(API_ENDPOINTS.ADMIN_RENTAL_ORDERS.ROOT, { params: { status, pageSize: PAGE_SIZE, pageNumber: 1 } })
    .then((response) => response.data?.items ?? []);

const isSameDay = (value, now) => {
  const date = new Date(value);
  return date.toDateString() === now.toDateString();
};

/**
 * Mỗi bước lấy đơn theo trạng thái rồi lọc theo tiến độ thiết bị:
 * - Giao: đơn đã thanh toán, chờ giao (Confirmed).
 * - Thu hồi: đơn đang thuê còn thiết bị ở khách.
 * - Quyết toán: đơn đã nhận lại hết thiết bị nhưng chưa đóng, hoặc đang chờ khách trả thêm.
 */
const STEPS = {
  handover: {
    title: 'Đơn chờ giao thiết bị',
    description: 'Đơn đã thanh toán, sắp hoặc đã tới giờ nhận đồ. Chọn đơn để quét và bàn giao.',
    statuses: ['Confirmed'],
    filter: () => true,
    sort: (a, b) => new Date(a.rentalStartAt) - new Date(b.rentalStartAt),
    route: ROUTES.OPS_HANDOVER,
    timeLabel: 'Nhận đồ',
    timeOf: (order) => order.rentalStartAt,
    empty: 'Không có đơn nào đang chờ giao.',
  },
  return: {
    title: 'Đơn cần thu hồi thiết bị',
    description: 'Khách đang giữ thiết bị. Đơn quá hạn trả được đưa lên đầu.',
    statuses: ['InFulfillment'],
    filter: (order) => order.issuedCount > 0,
    sort: (a, b) =>
      Number(b.isOverdue) - Number(a.isOverdue) || new Date(a.rentalEndAt) - new Date(b.rentalEndAt),
    route: ROUTES.OPS_RETURN,
    timeLabel: 'Hạn trả',
    timeOf: (order) => order.rentalEndAt,
    empty: 'Không có đơn nào đang cần thu hồi.',
  },
  settlement: {
    title: 'Đơn cần quyết toán & xử lý phí',
    description:
      'Đã nhận lại đủ thiết bị: duyệt phí nháp và quyết toán cọc. Bao gồm đơn đang chờ khách trả thêm.',
    statuses: ['InFulfillment', 'AwaitingSettlement'],
    filter: (order) =>
      order.status === 'AwaitingSettlement' ||
      (order.assetsCount > 0 && order.issuedCount === 0 && order.returnedCount > 0),
    sort: (a, b) =>
      b.draftChargesCount - a.draftChargesCount || new Date(a.rentalEndAt) - new Date(b.rentalEndAt),
    route: ROUTES.OPS_SETTLEMENT,
    timeLabel: 'Hạn trả',
    timeOf: (order) => order.rentalEndAt,
    empty: 'Không có đơn nào đang chờ quyết toán.',
  },
};

export default function FulfillmentWorklist({ step }) {
  const config = STEPS[step] ?? STEPS.handover;
  const navigate = useNavigate();
  const results = useQueries({
    queries: config.statuses.map((status) => ({
      queryKey: ['rental-fulfillment-worklist', status],
      queryFn: () => fetchOrders(status),
      staleTime: 30_000,
    })),
  });

  const isLoading = results.some((result) => result.isLoading);
  const failed = results.find((result) => result.isError);
  const now = new Date();
  const orders = results
    .flatMap((result) => result.data ?? [])
    .filter(config.filter)
    .sort(config.sort);

  return (
    <section className={styles.panel} aria-labelledby="fulfillment-worklist-title">
      <header className={styles.header}>
        <div>
          <h2 id="fulfillment-worklist-title">{config.title}</h2>
          <p>{config.description}</p>
        </div>
        {!isLoading && !failed && <span className={styles.count}>{orders.length} đơn</span>}
      </header>

      {isLoading && <Spinner />}
      {failed && (
        <ErrorState
          message={failed.error?.message || 'Không tải được danh sách đơn thuê.'}
          onRetry={() => results.forEach((result) => result.refetch())}
        />
      )}
      {!isLoading && !failed && orders.length === 0 && <EmptyState message={config.empty} />}
      {!isLoading && !failed && orders.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Mã đơn</th>
                <th scope="col">Khách hàng</th>
                <th scope="col">{config.timeLabel}</th>
                <th scope="col">Thiết bị</th>
                <th scope="col">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const time = config.timeOf(order);
                return (
                  <tr
                    key={order.orderId}
                    className={styles.row}
                    tabIndex={0}
                    onClick={() => navigate(config.route(encodeURIComponent(order.orderCode)))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') navigate(config.route(encodeURIComponent(order.orderCode)));
                    }}
                  >
                    <th scope="row">{order.orderCode}</th>
                    <td>{order.customerName}</td>
                    <td>
                      {formatDateTime(time)}
                      {isSameDay(time, now) && (
                        <span className={`${styles.badge} ${styles.today}`}>Hôm nay</span>
                      )}
                    </td>
                    <td>
                      {order.assetsCount} thiết bị
                      {step !== 'handover' && (
                        <small>
                          {' '}
                          · đang ở khách {order.issuedCount} · đã nhận lại {order.returnedCount}
                        </small>
                      )}
                    </td>
                    <td className={styles.flags}>
                      {order.isOverdue && (
                        <span className={`${styles.badge} ${styles.danger}`}>Quá hạn trả</span>
                      )}
                      {order.draftChargesCount > 0 && (
                        <span className={`${styles.badge} ${styles.warning}`}>
                          {order.draftChargesCount} phí nháp
                        </span>
                      )}
                      {order.status === 'AwaitingSettlement' && (
                        <span className={`${styles.badge} ${styles.warning}`}>Chờ khách trả thêm</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
