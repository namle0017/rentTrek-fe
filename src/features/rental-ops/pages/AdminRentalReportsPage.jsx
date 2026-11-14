import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { ORDER_STATUS_LABEL, USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import EvidencePhotoGallery from '@/features/rentals/components/EvidencePhotoGallery';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { rentalReportService } from '../api/rentalOpsService';
import { RENTAL_REPORT_STATUS_LABEL, RENTAL_REPORT_TYPE_LABEL } from '../constants/rentalOpsLabels';
import styles from './RentalOps.module.css';

const APPROVE_TEXT = {
  ReturnInspection: 'Duyệt phí & quyết toán cọc',
  SuspectedLoss: 'Xác nhận mất & quyết toán',
  ExtraPayment: 'Xác nhận đã thu ngoài hệ thống',
  NoShow: 'Đã xem',
  LateCancellation: 'Đã xem',
};

const APPROVE_HINT = {
  ReturnInspection:
    'Mọi phí nháp được chốt; cọc trừ phí. Còn dư → khách nhận yêu cầu nhập STK để hoàn. Thiếu → khách nhận QR thu thêm.',
  SuspectedLoss:
    'Thiết bị còn ở khách bị đánh dấu mất, lập phí bồi thường theo giá trị thiết bị, rồi quyết toán cọc như trên.',
  ExtraPayment: 'Chỉ dùng khi khách đã trả khoản thu thêm bằng tiền mặt hoặc chuyển khoản không qua QR.',
  NoShow: 'Đơn đã được huỷ và mở hồ sơ hoàn tự động. Xác nhận để đánh dấu đã xem.',
  LateCancellation: 'Đơn đã được huỷ và mở hồ sơ hoàn tự động. Xác nhận để đánh dấu đã xem.',
};

/** Báo cáo đơn thuê staff / hệ thống gửi admin: no-show, huỷ trễ, kiểm tra trả đồ, nghi mất, thu thêm. */
export default function AdminRentalReportsPage() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const [filters, setFilters] = useState({ status: 'Submitted', reportType: '' });
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const list = useQuery({
    queryKey: ['rental-reports', filters, pageNumber],
    queryFn: () => rentalReportService.getAll({ ...filters, pageNumber, pageSize: DEFAULT_PAGE_SIZE }),
    select: (res) => res.data,
    placeholderData: keepPreviousData,
  });
  const detail = useQuery({
    queryKey: ['rental-reports', 'detail', selectedId],
    queryFn: () => rentalReportService.getById(selectedId),
    select: (res) => res.data,
    enabled: Boolean(selectedId),
  });
  const onReviewed = (res) => {
    toast.success(res?.message || 'Đã xử lý báo cáo.');
    queryClient.invalidateQueries({ queryKey: ['rental-reports'] });
    setSelectedId(null);
    setReviewNote('');
  };
  const approve = useMutation({ mutationFn: rentalReportService.approve, onSuccess: onReviewed });
  const reject = useMutation({ mutationFn: rentalReportService.reject, onSuccess: onReviewed });
  const report = detail.data;
  const reviewError = approve.error || reject.error;

  const renderList = () => {
    if (list.isLoading) return <Spinner />;
    if (list.isError) return <ErrorState message={list.error?.message} onRetry={list.refetch} />;
    if (!list.data?.items?.length) return <EmptyState message="Không có báo cáo phù hợp" />;
    return (
      <>
        <div className={styles.panel} aria-busy={list.isFetching}>
          <div className={styles.tableScroll} tabIndex="0">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Thời gian</th>
                  <th scope="col">Đơn</th>
                  <th scope="col">Khách</th>
                  <th scope="col">Loại</th>
                  <th scope="col">Số tiền</th>
                  <th scope="col">Người gửi</th>
                  <th scope="col">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {list.data.items.map((r) => (
                  <tr key={r.rentalReportId} className={styles.clickableRow} onClick={() => setSelectedId(r.rentalReportId)}>
                    <td className={styles.nowrap}>{formatDateTime(r.createdAt)}</td>
                    <td className={styles.code}>{r.orderCode}</td>
                    <td>{r.customerName}</td>
                    <td>{RENTAL_REPORT_TYPE_LABEL[r.reportType] || r.reportType}</td>
                    <td className={styles.nowrap}>{formatCurrency(r.amount)}</td>
                    <td>{r.createdByName || 'Hệ thống'}</td>
                    <td>
                      <span className={r.status === 'Submitted' ? styles.badgeWarn : undefined}>
                        {RENTAL_REPORT_STATUS_LABEL[r.status] || r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          pageNumber={list.data.pageNumber}
          totalPages={list.data.totalPages}
          hasPrevious={list.data.hasPrevious}
          hasNext={list.data.hasNext}
          totalItems={list.data.totalItems}
          onPageChange={setPageNumber}
        />
      </>
    );
  };

  return (
    <section className={styles.page} aria-label="Báo cáo đơn thuê">
      <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
        <label className={styles.field}>
          <span>Trạng thái</span>
          <select
            value={filters.status}
            onChange={(event) => {
              setPageNumber(DEFAULT_PAGE_NUMBER);
              setFilters({ ...filters, status: event.target.value });
            }}
          >
            <option value="">Tất cả</option>
            {Object.entries(RENTAL_REPORT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Loại báo cáo</span>
          <select
            value={filters.reportType}
            onChange={(event) => {
              setPageNumber(DEFAULT_PAGE_NUMBER);
              setFilters({ ...filters, reportType: event.target.value });
            }}
          >
            <option value="">Tất cả</option>
            {Object.entries(RENTAL_REPORT_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </form>
      {renderList()}

      {selectedId && (
        <Modal title="Chi tiết báo cáo" onClose={() => setSelectedId(null)}>
          {detail.isLoading && <Spinner />}
          {detail.isError && <ErrorState message={detail.error?.message} onRetry={detail.refetch} />}
          {report && (
            <div className={styles.page}>
              <p>
                <strong>{RENTAL_REPORT_TYPE_LABEL[report.reportType] || report.reportType}</strong> ·{' '}
                {RENTAL_REPORT_STATUS_LABEL[report.status] || report.status}
              </p>
              <p>
                Đơn{' '}
                <Link to={ROUTES.ADMIN_RENTAL_ORDER_DETAIL(report.orderId)} className={styles.code}>
                  {report.orderCode}
                </Link>{' '}
                ({ORDER_STATUS_LABEL[report.orderStatus] || report.orderStatus}) · {report.customerName} ·{' '}
                {report.customerEmail}
              </p>
              <p>Số tiền: {formatCurrency(report.amount)}</p>
              {report.note && <p className={styles.reason}>{report.note}</p>}
              {report.reviewNote && <p className={styles.muted}>Ghi chú duyệt: {report.reviewNote}</p>}
              <EvidencePhotoGallery photos={report.evidencePhotos} onOpen={setLightboxUrl} />
              {report.status === 'Submitted' && isAdmin && (
                <>
                  <p className={styles.hint}>{APPROVE_HINT[report.reportType]}</p>
                  <label className={styles.field}>
                    <span>Ghi chú (bắt buộc khi từ chối)</span>
                    <textarea rows={3} maxLength={1000} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                  </label>
                  {reviewError && (
                    <p role="alert" className={styles.alert}>
                      {reviewError.message}
                    </p>
                  )}
                  <div className={styles.actions}>
                    {['ReturnInspection', 'SuspectedLoss'].includes(report.reportType) && (
                      <button
                        type="button"
                        disabled={reject.isPending || approve.isPending}
                        onClick={() =>
                          reject.mutate({
                            reportId: report.rentalReportId,
                            reviewNote: reviewNote.trim(),
                            expectedRowVersion: report.rowVersion,
                          })
                        }
                      >
                        Trả lại staff
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={reject.isPending || approve.isPending}
                      onClick={() =>
                        approve.mutate({
                          reportId: report.rentalReportId,
                          reviewNote: reviewNote.trim() || undefined,
                          expectedRowVersion: report.rowVersion,
                        })
                      }
                    >
                      {approve.isPending ? 'Đang xử lý...' : APPROVE_TEXT[report.reportType]}
                    </button>
                  </div>
                </>
              )}
              {report.status === 'Submitted' && !isAdmin && <p className={styles.hint}>Chờ admin duyệt.</p>}
            </div>
          )}
        </Modal>
      )}
      {lightboxUrl && (
        <Modal title="Ảnh bằng chứng" onClose={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Ảnh bằng chứng" style={{ maxWidth: '100%' }} />
        </Modal>
      )}
    </section>
  );
}
