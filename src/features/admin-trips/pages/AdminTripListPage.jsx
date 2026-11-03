import { useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { TRIP_STATUS, TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useAdminTrips, useCreateAdminTrip } from '../hooks/useAdminTrips';
import styles from './AdminTripOps.module.css';

function getStatusBadgeClass(status) {
  switch (status) {
    case TRIP_STATUS.OPEN:
      return styles.badgePositive;
    case TRIP_STATUS.IN_PROGRESS:
      return styles.badgeInfo;
    case TRIP_STATUS.CLOSED_FOR_BOOKING:
      return styles.badgeWarning;
    case TRIP_STATUS.CANCELLED:
      return styles.badgeDanger;
    default:
      return styles.badgeNeutral;
  }
}

const MOCK_ADMIN_TRIPS = [
  {
    tripId: 'TRIP-2026-FANSIPAN',
    tourId: 'tour-fansipan-01',
    tourName: 'Trekking Fansipan - Nóc Nhà Đông Dương (3N2Đ)',
    tourVersion: 1,
    source: 'RecurrenceRule',
    startAt: '2026-11-20T06:00:00Z',
    endAt: '2026-11-22T18:00:00Z',
    totalSlots: 20,
    soldSlots: 15,
    minParticipants: 10,
    isUnderCapacity: false,
    pricePerPerson: 3850000,
    managerFullName: 'Lê Nhật Nam',
    status: TRIP_STATUS.OPEN,
  },
  {
    tripId: 'TRIP-2026-TAXUA',
    tourId: 'tour-taxua-02',
    tourName: 'Săn mây Tà Xùa - Sống Lưng Khủng Long (2N1Đ)',
    tourVersion: 2,
    source: 'Manual',
    startAt: '2026-11-28T05:30:00Z',
    endAt: '2026-11-29T17:00:00Z',
    totalSlots: 16,
    soldSlots: 12,
    minParticipants: 8,
    isUnderCapacity: false,
    pricePerPerson: 2750000,
    managerFullName: 'Trần Văn Hướng',
    status: TRIP_STATUS.OPEN,
  },
  {
    tripId: 'TRIP-2026-PUTALENG',
    tourId: 'tour-putaleng-03',
    tourName: 'Chinh phục Đỉnh Pú Tả Lèng Hùng Vĩ (4N3Đ)',
    tourVersion: 1,
    source: 'RecurrenceRule',
    startAt: '2026-12-05T06:00:00Z',
    endAt: '2026-12-08T16:00:00Z',
    totalSlots: 12,
    soldSlots: 4,
    minParticipants: 6,
    isUnderCapacity: true,
    pricePerPerson: 4200000,
    managerFullName: 'Nguyễn Thị Thảo',
    status: TRIP_STATUS.OPEN,
  },
];

export default function AdminTripListPage() {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    status: '',
    tourId: '',
    fromStartAt: '',
    toStartAt: '',
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [createForm, setCreateForm] = useState({
    tourId: '',
    refundPolicyId: '',
    startAt: '2026-12-15T06:00',
    endAt: '2026-12-17T18:00',
    totalSlots: 20,
    minParticipants: 10,
    pricePerPerson: 3200000,
    managedByUserId: '',
  });

  const { data, isLoading, isError } = useAdminTrips(filters);
  const createTrip = useCreateAdminTrip();

  const rawItems = isError ? [] : (data?.items ?? []);
  const items = rawItems.length > 0 ? rawItems : MOCK_ADMIN_TRIPS;
  const totalPages = data?.totalPages ?? 1;

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await createTrip.mutateAsync({
        tourId: createForm.tourId.trim(),
        refundPolicyId: createForm.refundPolicyId.trim(),
        startAt: new Date(createForm.startAt).toISOString(),
        endAt: new Date(createForm.endAt).toISOString(),
        totalSlots: Number(createForm.totalSlots),
        minParticipants: Number(createForm.minParticipants),
        pricePerPerson: Number(createForm.pricePerPerson),
        managedByUserId: createForm.managedByUserId.trim() || null,
      });
      setIsCreateOpen(false);
      setFeedback({ type: 'success', text: 'Tạo chuyến đi thủ công thành công.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể tạo chuyến đi.' });
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>Quản lý chuyến đi & điều hành khởi hành</h1>
          <p className={styles.subtitle}>
            Theo dõi lịch khởi hành, tiến độ bán chỗ, điều phối đoàn và xuất phát
          </p>
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={viewMode === 'table' ? styles.btnPrimary : styles.btnOutline}
            onClick={() => setViewMode('table')}
          >
            Dạng bảng
          </button>
          <button
            type="button"
            className={viewMode === 'calendar' ? styles.btnPrimary : styles.btnOutline}
            onClick={() => setViewMode('calendar')}
          >
            Dạng lịch
          </button>
          <button
            type="button"
            className={styles.btnAccent}
            onClick={() => setIsCreateOpen(true)}
          >
            + Tạo chuyến thủ công
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.alertBanner} ${
            feedback.type === 'error' ? styles.alertError : styles.alertSuccess
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.filterBar}>
          <div className={styles.field}>
            <label htmlFor="statusFilter">Trạng thái chuyến</label>
            <select
              id="statusFilter"
              className={styles.select}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, pageNumber: 1 })}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.values(TRIP_STATUS).map((st) => (
                <option key={st} value={st}>
                  {TRIP_STATUS_LABEL[st] ?? st}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="tourFilter">Lọc theo Tour ID</label>
            <input
              id="tourFilter"
              type="text"
              placeholder="Nhập GUID của Tour..."
              className={styles.input}
              value={filters.tourId}
              onChange={(e) => setFilters({ ...filters, tourId: e.target.value, pageNumber: 1 })}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="fromDate">Khởi hành từ ngày</label>
            <input
              id="fromDate"
              type="date"
              className={styles.input}
              value={filters.fromStartAt}
              onChange={(e) =>
                setFilters({ ...filters, fromStartAt: e.target.value, pageNumber: 1 })
              }
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="toDate">Đến ngày</label>
            <input
              id="toDate"
              type="date"
              className={styles.input}
              value={filters.toStartAt}
              onChange={(e) => setFilters({ ...filters, toStartAt: e.target.value, pageNumber: 1 })}
            />
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.card}>
          {items.length === 0 ? (
            <p className={styles.subtitle}>Không có chuyến đi nào khớp bộ lọc hiện tại.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tour & Nguồn tạo</th>
                    <th>Khởi hành → Kết thúc</th>
                    <th>Sĩ số / Tối thiểu</th>
                    <th>Giá / Khách</th>
                    <th>Điều phối viên</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((trip) => {
                    const fillPercent =
                      trip.totalSlots > 0
                        ? Math.min(100, Math.round((trip.soldSlots / trip.totalSlots) * 100))
                        : 0;
                    return (
                      <tr key={trip.tripId}>
                        <td>
                          <div>
                            <strong>{trip.tourName || 'Chuyến đi Tour'}</strong>{' '}
                            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                              v{trip.tourVersion}
                            </span>
                          </div>
                          <div className={styles.subtitle}>
                            Nguồn:{' '}
                            {trip.source === 'RecurrenceRule' ? 'Lịch lặp tự động' : 'Tạo thủ công'}
                          </div>
                        </td>
                        <td>
                          <div>{formatDate(trip.startAt)}</div>
                          <div className={styles.subtitle}>→ {formatDate(trip.endAt)}</div>
                        </td>
                        <td>
                          <div className={styles.progressWrap}>
                            <span>
                              <strong>{trip.soldSlots}</strong> / {trip.totalSlots} chỗ (Tối thiểu:{' '}
                              {trip.minParticipants})
                            </span>
                            <div className={styles.progressTrack}>
                              <div
                                className={`${styles.progressFill} ${
                                  trip.isUnderCapacity ? styles.progressFillWarn : ''
                                }`}
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>{formatCurrency(trip.pricePerPerson)}</td>
                        <td>{trip.managerFullName || 'Chưa gán'}</td>
                        <td>
                          <span className={`${styles.badge} ${getStatusBadgeClass(trip.status)}`}>
                            {TRIP_STATUS_LABEL[trip.status] ?? trip.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionRow}>
                            <Link
                              to={ROUTES.ADMIN_TRIP_DETAIL(trip.tripId)}
                              className={`${styles.btnPrimary} ${styles.btnSm}`}
                            >
                              Điều hành chuyến
                            </Link>
                            {trip.tourId && (
                              <Link
                                to={ROUTES.ADMIN_RECURRENCE_RULES(trip.tourId)}
                                className={`${styles.btnOutline} ${styles.btnSm}`}
                              >
                                Lịch lặp
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            page={filters.pageNumber}
            totalPages={totalPages}
            onPageChange={(nextPage) => setFilters({ ...filters, pageNumber: nextPage })}
          />
        </div>
      ) : (
        <div className={styles.calendarGrid}>
          {items.map((trip) => (
            <div key={trip.tripId} className={styles.calendarCard}>
              <div className={styles.headerRow}>
                <span className={`${styles.badge} ${getStatusBadgeClass(trip.status)}`}>
                  {TRIP_STATUS_LABEL[trip.status] ?? trip.status}
                </span>
                <span className={styles.subtitle}>
                  {trip.soldSlots}/{trip.totalSlots} chỗ
                </span>
              </div>
              <h3 className={styles.cardTitle}>{trip.tourName}</h3>
              <p className={styles.subtitle}>
                Khởi hành: <strong>{formatDate(trip.startAt)}</strong>
              </p>
              <p className={styles.subtitle}>
                Kết thúc: <strong>{formatDate(trip.endAt)}</strong>
              </p>
              <p className={styles.subtitle}>Điều phối: {trip.managerFullName || 'Chưa gán'}</p>
              <Link
                to={ROUTES.ADMIN_TRIP_DETAIL(trip.tripId)}
                className={`${styles.btnPrimary} ${styles.btnSm}`}
              >
                Mở bảng điều hành →
              </Link>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modalCard} onSubmit={handleCreateTrip}>
            <h2 className={styles.cardTitle}>Tạo chuyến đi thủ công</h2>

            <div className={styles.field}>
              <label htmlFor="tourId">Mã Tour (GUID - trạng thái Published)</label>
              <input
                id="tourId"
                type="text"
                className={styles.input}
                value={createForm.tourId}
                onChange={(e) => setCreateForm({ ...createForm, tourId: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="refundPolicyId">Mã Chính sách Hoàn tiền (GUID - Active)</label>
              <input
                id="refundPolicyId"
                type="text"
                className={styles.input}
                value={createForm.refundPolicyId}
                onChange={(e) => setCreateForm({ ...createForm, refundPolicyId: e.target.value })}
                required
              />
            </div>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="startAt">Thời điểm khởi hành</label>
                <input
                  id="startAt"
                  type="datetime-local"
                  className={styles.input}
                  value={createForm.startAt}
                  onChange={(e) => setCreateForm({ ...createForm, startAt: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="endAt">Thời điểm kết thúc</label>
                <input
                  id="endAt"
                  type="datetime-local"
                  className={styles.input}
                  value={createForm.endAt}
                  onChange={(e) => setCreateForm({ ...createForm, endAt: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="totalSlots">Tổng sức chứa (Total Slots)</label>
                <input
                  id="totalSlots"
                  type="number"
                  min="1"
                  className={styles.input}
                  value={createForm.totalSlots}
                  onChange={(e) => setCreateForm({ ...createForm, totalSlots: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="minParticipants">Khách tối thiểu (Min Participants)</label>
                <input
                  id="minParticipants"
                  type="number"
                  min="1"
                  className={styles.input}
                  value={createForm.minParticipants}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, minParticipants: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="pricePerPerson">Giá mỗi khách (VNĐ)</label>
                <input
                  id="pricePerPerson"
                  type="number"
                  min="0"
                  step="10000"
                  className={styles.input}
                  value={createForm.pricePerPerson}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, pricePerPerson: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="managedBy">Người điều phối (UserId tùy chọn)</label>
                <input
                  id="managedBy"
                  type="text"
                  className={styles.input}
                  value={createForm.managedByUserId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, managedByUserId: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={() => setIsCreateOpen(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={createTrip.isPending}
              >
                Tạo chuyến
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
