import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { ORDER_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateTime } from '@/utils/formatDate';
import CustomerReportStatusBadge from '../components/CustomerReportStatusBadge';
import {
  CUSTOMER_REPORT_SOURCE,
  CUSTOMER_REPORT_SOURCE_LABEL,
  CUSTOMER_REPORT_STATUS,
  CUSTOMER_REPORT_STATUS_LABEL,
  PREFERRED_ACTION_LABEL,
  categoryLabel,
} from '../constants/customerReportLabels';
import {
  useAdminCustomerReport,
  useAdminCustomerReports,
  useCustomerReportSummary,
  useUpdateCustomerReportStatus,
} from '../hooks/useCustomerReports';
import styles from './AdminCustomerReportsPage.module.css';

const STATUS_TABS = [
  { value: CUSTOMER_REPORT_STATUS.OPEN, label: 'Mới gửi' },
  { value: CUSTOMER_REPORT_STATUS.IN_PROGRESS, label: 'Đang xử lý' },
  { value: CUSTOMER_REPORT_STATUS.RESOLVED, label: 'Đã xử lý' },
  { value: CUSTOMER_REPORT_STATUS.REJECTED, label: 'Từ chối' },
  { value: '', label: 'Tất cả' },
];

const SUMMARY_KEY = {
  Open: 'open',
  InProgress: 'inProgress',
  Resolved: 'resolved',
  Rejected: 'rejected',
};

function orderLink(report) {
  return report.sourceType === CUSTOMER_REPORT_SOURCE.RENTAL
    ? ROUTES.ADMIN_RENTAL_ORDER_DETAIL(report.orderId)
    : ROUTES.ADMIN_ORDER(report.orderCode);
}

/** Màn "Báo cáo từ khách hàng": báo cáo khách gửi về đơn thuê và chuyến đi, Admin / Staff xử lý và phản hồi. */
export default function AdminCustomerReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState(CUSTOMER_REPORT_STATUS.OPEN);
  const [sourceType, setSourceType] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const debouncedKeyword = useDebounce(keyword.trim(), 400);
  const selectedId = searchParams.get('id');

  const list = useAdminCustomerReports({
    status,
    sourceType,
    keyword: debouncedKeyword,
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const summary = useCustomerReportSummary();

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPageNumber(DEFAULT_PAGE_NUMBER);
  };

  const openDetail = (id) => setSearchParams(id ? { id } : {});

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
                  <th scope="col">Nguồn</th>
                  <th scope="col">Đơn</th>
                  <th scope="col">Khách</th>
                  <th scope="col">Vấn đề</th>
                  <th scope="col">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {list.data.items.map((report) => (
                  <tr
                    key={report.customerReportId}
                    className={styles.clickableRow}
                    tabIndex="0"
                    onClick={() => openDetail(report.customerReportId)}
                    onKeyDown={(event) => event.key === 'Enter' && openDetail(report.customerReportId)}
                  >
                    <td className={styles.nowrap}>{formatDateTime(report.createdAt)}</td>
                    <td>
                      <span className={styles.source}>
                        {CUSTOMER_REPORT_SOURCE_LABEL[report.sourceType] || report.sourceType}
                      </span>
                    </td>
                    <td>
                      <span className={styles.code}>{report.orderCode}</span>
                      {report.tourName && <small className={styles.sub}>{report.tourName}</small>}
                    </td>
                    <td>
                      {report.reporterName}
                      <small className={styles.sub}>{report.reporterPhone || report.reporterEmail}</small>
                    </td>
                    <td className={styles.issueCell}>
                      <strong>{categoryLabel(report.sourceType, report.category)}</strong>
                      <small className={styles.sub}>{report.description}</small>
                    </td>
                    <td>
                      <CustomerReportStatusBadge status={report.status} />
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
    <section className={styles.page} aria-label="Báo cáo từ khách hàng">
      <header className={styles.pageHeader}>
        <p className={styles.hint}>
          Khách gửi báo cáo từ trang chi tiết đơn thuê (sự cố thiết bị) và chuyến đi (hướng dẫn viên, lịch
          trình, an toàn, dịch vụ). Phản hồi khi đóng báo cáo sẽ được gửi thông báo tới khách.
        </p>
      </header>

      <div className={styles.tabs} role="group" aria-label="Lọc theo trạng thái">
        {STATUS_TABS.map((tab) => {
          const count = tab.value ? summary.data?.[SUMMARY_KEY[tab.value]] : undefined;
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              aria-pressed={status === tab.value}
              onClick={() => changeFilter(setStatus)(tab.value)}
            >
              {tab.label}
              {count > 0 && <span className={styles.count}>{count}</span>}
            </button>
          );
        })}
      </div>

      <form className={styles.filters} onSubmit={(event) => event.preventDefault()}>
        <label className={styles.field}>
          <span>Nguồn</span>
          <select value={sourceType} onChange={(event) => changeFilter(setSourceType)(event.target.value)}>
            <option value="">Đơn thuê & chuyến đi</option>
            {Object.entries(CUSTOMER_REPORT_SOURCE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={`${styles.field} ${styles.searchField}`}>
          <span>Tìm kiếm</span>
          <input
            type="search"
            placeholder="Mã đơn, tên / email / SĐT khách, thiết bị…"
            value={keyword}
            onChange={(event) => changeFilter(setKeyword)(event.target.value)}
          />
        </label>
      </form>

      {renderList()}

      {selectedId && <ReportDetailModal reportId={selectedId} onClose={() => openDetail(null)} />}
    </section>
  );
}

function ReportDetailModal({ reportId, onClose }) {
  const detail = useAdminCustomerReport(reportId);
  const update = useUpdateCustomerReportStatus();
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const report = detail.data;
  const isClosed =
    report?.status === CUSTOMER_REPORT_STATUS.RESOLVED || report?.status === CUSTOMER_REPORT_STATUS.REJECTED;

  const submit = (nextStatus) => {
    const adminNote = note.trim();
    if (nextStatus !== CUSTOMER_REPORT_STATUS.IN_PROGRESS && !adminNote) {
      setNoteError('Nhập phản hồi cho khách trước khi đóng báo cáo.');
      return;
    }
    setNoteError('');
    update.mutate(
      { id: reportId, status: nextStatus, adminNote: adminNote || undefined },
      { onSuccess: () => setNote('') },
    );
  };

  return (
    <Modal title="Chi tiết báo cáo" onClose={onClose}>
      {detail.isLoading && <Spinner />}
      {detail.isError && <ErrorState message={detail.error?.message} onRetry={detail.refetch} />}
      {report && (
        <div className={styles.detail}>
          <div className={styles.detailHead}>
            <strong>
              {CUSTOMER_REPORT_SOURCE_LABEL[report.sourceType]} ·{' '}
              {categoryLabel(report.sourceType, report.category)}
            </strong>
            <CustomerReportStatusBadge status={report.status} />
          </div>

          <dl className={styles.facts}>
            <dt>Đơn</dt>
            <dd>
              <Link to={orderLink(report)} className={styles.code}>
                {report.orderCode}
              </Link>{' '}
              ({ORDER_STATUS_LABEL[report.orderStatus] || report.orderStatus})
            </dd>
            {report.tourName && (
              <>
                <dt>Chuyến</dt>
                <dd>
                  {report.tourName}
                  {report.tripStartAt && ` · khởi hành ${formatDateTime(report.tripStartAt)}`}
                </dd>
              </>
            )}
            {report.subjectLabel && (
              <>
                <dt>{report.sourceType === CUSTOMER_REPORT_SOURCE.RENTAL ? 'Thiết bị' : 'Liên quan'}</dt>
                <dd>{report.subjectLabel}</dd>
              </>
            )}
            <dt>Khách</dt>
            <dd>
              {report.reporterName}
              {report.reporterEmail && ` · ${report.reporterEmail}`}
              {report.reporterPhone && ` · ${report.reporterPhone}`}
            </dd>
            {report.contactPhone && (
              <>
                <dt>SĐT liên hệ</dt>
                <dd>
                  <a href={`tel:${report.contactPhone}`}>{report.contactPhone}</a>
                </dd>
              </>
            )}
            {report.preferredAction && (
              <>
                <dt>Mong muốn</dt>
                <dd>{PREFERRED_ACTION_LABEL[report.preferredAction] || report.preferredAction}</dd>
              </>
            )}
            <dt>Gửi lúc</dt>
            <dd>{formatDateTime(report.createdAt)}</dd>
          </dl>

          <p className={styles.description}>{report.description}</p>

          {report.photoUrls?.length > 0 && (
            <div className={styles.photos}>
              {report.photoUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  className={styles.photo}
                  onClick={() => setLightboxUrl(url)}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img src={url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {report.adminNote && (
            <p className={styles.reply}>
              <strong>Phản hồi đã gửi khách:</strong> {report.adminNote}
              {report.handledByName && (
                <small>
                  {' '}
                  — {report.handledByName}, {formatDateTime(report.handledAt)}
                </small>
              )}
            </p>
          )}

          {!isClosed && (
            <div className={styles.handle}>
              <label className={styles.field}>
                <span>Phản hồi cho khách (bắt buộc khi đóng báo cáo)</span>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ví dụ: Kho đã gửi lều thay thế, nhân viên sẽ liên hệ trong 30 phút."
                />
              </label>
              {(noteError || update.error) && (
                <p role="alert" className={styles.alert}>
                  {noteError || update.error?.message}
                </p>
              )}
              <div className={styles.actions}>
                {report.status === CUSTOMER_REPORT_STATUS.OPEN && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={update.isPending}
                    onClick={() => submit(CUSTOMER_REPORT_STATUS.IN_PROGRESS)}
                  >
                    Nhận xử lý
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={update.isPending}
                  onClick={() => submit(CUSTOMER_REPORT_STATUS.REJECTED)}
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={update.isPending}
                  onClick={() => submit(CUSTOMER_REPORT_STATUS.RESOLVED)}
                >
                  {update.isPending ? 'Đang lưu…' : 'Đánh dấu đã xử lý'}
                </button>
              </div>
            </div>
          )}
          {isClosed && (
            <p className={styles.hint}>
              Báo cáo đã {CUSTOMER_REPORT_STATUS_LABEL[report.status]?.toLowerCase()}, không thể cập nhật
              thêm.
            </p>
          )}
        </div>
      )}
      {lightboxUrl && (
        <Modal title="Ảnh khách gửi" onClose={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Ảnh khách gửi" className={styles.lightbox} />
        </Modal>
      )}
    </Modal>
  );
}
