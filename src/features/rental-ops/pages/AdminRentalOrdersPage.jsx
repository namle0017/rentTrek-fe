import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { ORDER_PAYMENT_STATUS_LABEL, ORDER_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/formatDate';
import { useAdminRentalOrders } from '../hooks/useRentalOps';
import styles from './RentalOps.module.css';

const INITIAL_FILTERS = { search: '', status: '', overdueOnly: false };
const STATUS_FILTERS = ['PendingPayment', 'Confirmed', 'InFulfillment', 'Completed', 'Cancelled', 'Expired'];

export default function AdminRentalOrdersPage() {
  const navigate = useNavigate();
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const { data: pagedOrders, isLoading, isError, error, refetch, isFetching } = useAdminRentalOrders({
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    search: filters.search,
    status: filters.status,
    overdueOnly: filters.overdueOnly || undefined,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setPageNumber(DEFAULT_PAGE_NUMBER);
    setFilters({ ...draftFilters, search: draftFilters.search.trim() });
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!pagedOrders?.items.length) return <EmptyState message="Chưa có đơn thuê phù hợp" />;

    return (
      <>
        <div className={styles.panel} aria-busy={isFetching}>
          <div className={styles.tableScroll} tabIndex="0" aria-label="Bảng đơn thuê, cuộn ngang trên màn hình nhỏ">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Mã đơn</th>
                  <th scope="col">Khách</th>
                  <th scope="col">Thời gian thuê</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Thanh toán</th>
                  <th scope="col">Thiết bị (đang ở khách / đã trả / tổng)</th>
                  <th scope="col">Cần xử lý</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.items.map((order) => (
                  <tr
                    key={order.orderId}
                    className={styles.clickableRow}
                    onClick={() => navigate(ROUTES.ADMIN_RENTAL_ORDER_DETAIL(order.orderId))}
                  >
                    <td>
                      <Link to={ROUTES.ADMIN_RENTAL_ORDER_DETAIL(order.orderId)} className={styles.code}>
                        {order.orderCode}
                      </Link>
                    </td>
                    <td>{order.customerName}</td>
                    <td className={styles.nowrap}>
                      {formatDateTime(order.rentalStartAt)}
                      <br />→ {formatDateTime(order.rentalEndAt)}
                    </td>
                    <td>{ORDER_STATUS_LABEL[order.status] ?? order.status}</td>
                    <td>{ORDER_PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}</td>
                    <td className={styles.nowrap}>
                      {order.issuedCount} / {order.returnedCount} / {order.assetsCount}
                    </td>
                    <td>
                      {order.isOverdue && <span className={styles.badgeDanger}>Quá hạn trả</span>}
                      {order.draftChargesCount > 0 && (
                        <span className={styles.badgeWarn}>{order.draftChargesCount} phí đề xuất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          pageNumber={pagedOrders.pageNumber}
          totalPages={pagedOrders.totalPages}
          hasPrevious={pagedOrders.hasPrevious}
          hasNext={pagedOrders.hasNext}
          onPageChange={setPageNumber}
        />
      </>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="rental-orders-title">
      <header>
        <p className={styles.eyebrow}>Vận hành</p>
        <h1 id="rental-orders-title" className={styles.title}>
          Đơn thuê
        </h1>
        <p className={styles.hint}>Giao đồ, nhận trả từng thiết bị, lập phí trễ / hỏng / mất và đóng đơn.</p>
      </header>

      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Tìm đơn</span>
          <input
            type="search"
            placeholder="Mã đơn, tên hoặc email khách"
            maxLength="200"
            value={draftFilters.search}
            onChange={(event) => setDraftFilters({ ...draftFilters, search: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Trạng thái</span>
          <select
            value={draftFilters.status}
            onChange={(event) => setDraftFilters({ ...draftFilters, status: event.target.value })}
          >
            <option value="">Tất cả</option>
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={draftFilters.overdueOnly}
            onChange={(event) => setDraftFilters({ ...draftFilters, overdueOnly: event.target.checked })}
          />
          Chỉ đơn quá hạn trả
        </label>
        <button type="submit" className="btn btn-primary">
          Lọc danh sách
        </button>
      </form>

      {renderContent()}
    </section>
  );
}
