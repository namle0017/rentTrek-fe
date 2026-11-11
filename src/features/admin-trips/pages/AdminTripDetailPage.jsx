import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { TRIP_STATUS, TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { adminTripService } from '../api/adminTripService';
import TripAttendanceMatrixTab from '../components/TripAttendanceMatrixTab';
import TripKanbanBoardTab from '../components/TripKanbanBoardTab';
import {
  useAdminTripDetail,
  useTripBookings,
  useTripLifecycleActions,
  useTripReadinessChecklist,
  useUpdateAdminTrip,
} from '../hooks/useAdminTrips';
import styles from './AdminTripOps.module.css';

export default function AdminTripDetailPage() {
  const { tripId } = useParams();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'kanban' | 'attendance'
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [feedback, setFeedback] = useState(null);

  const { data: trip, isLoading, isError, error, refetch } = useAdminTripDetail(tripId);
  const { data: readiness } = useTripReadinessChecklist(tripId);
  const { data: bookings = [] } = useTripBookings(tripId);
  const updateTrip = useUpdateAdminTrip(tripId);
  const { openBooking, closeBooking, startTrip, completeTrip, cancelTrip } = useTripLifecycleActions(tripId);

  const [editForm, setEditForm] = useState(null);

  const openEditModal = () => {
    if (!trip) return;
    setEditForm({
      startAt: trip.startAt ? trip.startAt.slice(0, 16) : '',
      endAt: trip.endAt ? trip.endAt.slice(0, 16) : '',
      totalSlots: trip.totalSlots,
      minParticipants: trip.minParticipants,
      pricePerPerson: trip.pricePerPerson,
      rowVersion: trip.rowVersion,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await updateTrip.mutateAsync({
        startAt: new Date(editForm.startAt).toISOString(),
        endAt: new Date(editForm.endAt).toISOString(),
        totalSlots: Number(editForm.totalSlots),
        minParticipants: Number(editForm.minParticipants),
        pricePerPerson: Number(editForm.pricePerPerson),
        rowVersion: Number(editForm.rowVersion),
      });
      setIsEditOpen(false);
      setFeedback({ type: 'success', text: 'Đã cập nhật thông tin chuyến đi thành công.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể cập nhật chuyến đi.' });
    }
  };

  const runStateAction = async (mutation, successText) => {
    setFeedback(null);
    try {
      await mutation.mutateAsync();
      setFeedback({ type: 'success', text: successText });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Thao tác chuyển trạng thái thất bại.' });
    }
  };

  const handleCancelTrip = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await cancelTrip.mutateAsync({ reason: cancelReason.trim() });
      const info = res.data;
      setIsCancelOpen(false);
      setCancelReason('');
      setFeedback({
        type: 'success',
        text: `Đã hủy chuyến khẩn cấp. Đơn ảnh hưởng: ${
          info?.affectedBookingsCount ?? 0
        }, khách: ${info?.affectedParticipantsCount ?? 0}, tổng hoàn tiền chờ duyệt: ${formatCurrency(
          info?.totalRefundAmount ?? 0,
        )}, thiết bị giải phóng: ${info?.releasedAssetsCount ?? 0}.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể hủy chuyến đi.' });
    }
  };

  const handleExportCsv = async () => {
    try {
      await adminTripService.downloadManifestCsv(tripId);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể xuất file CSV Manifest.' });
    }
  };

  if (isLoading) return <Spinner />;
  if (isError || !trip) return <ErrorState message={error?.message} onRetry={refetch} />;

  const checklist = readiness?.checklist;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <Breadcrumb
            items={[
              { label: 'Quản lý Chuyến đi', to: ROUTES.ADMIN_TRIPS },
              trip.tourName ? { label: trip.tourName } : null,
              { label: 'Chi tiết & Điều phối Chuyến' },
            ]}
          />
          <h1 className={styles.pageTitle}>
            {trip.tourName || 'Chuyến đi Tour'}{' '}
            <span className={`${styles.badge} ${styles.badgePositive}`}>
              {TRIP_STATUS_LABEL[trip.status] ?? trip.status}
            </span>
          </h1>
          <p className={styles.subtitle}>
            Khởi hành: <strong>{formatDate(trip.startAt)}</strong> → Kết thúc:{' '}
            <strong>{formatDate(trip.endAt)}</strong> · Phiên bản lịch trình v{trip.tourVersion}
          </p>
        </div>

        <div className={styles.actionRow}>
          <Link to={ROUTES.ADMIN_TRIPS} className={styles.btnOutline}>
            ← Quay lại danh sách
          </Link>

          {(trip.status === TRIP_STATUS.DRAFT || trip.status === TRIP_STATUS.CLOSED_FOR_BOOKING) && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => runStateAction(openBooking, 'Đã mở nhận khách (Open).')}
            >
              Mở nhận khách (Open)
            </button>
          )}

          {trip.status === TRIP_STATUS.OPEN && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => runStateAction(closeBooking, 'Đã chốt danh sách nhận khách (ClosedForBooking).')}
            >
              Chốt danh sách (Close Booking)
            </button>
          )}

          {trip.status === TRIP_STATUS.CLOSED_FOR_BOOKING && (
            <button
              type="button"
              className={styles.btnAccent}
              onClick={() => runStateAction(startTrip, 'Đoàn đã bắt đầu xuất phát (InProgress).')}
            >
              Xuất phát chuyến đi (Start)
            </button>
          )}

          {trip.status === TRIP_STATUS.IN_PROGRESS && (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => runStateAction(completeTrip, 'Đã hoàn tất chuyến đi (Completed).')}
            >
              Hoàn tất chuyến đi
            </button>
          )}

          <button type="button" className={styles.btnOutline} onClick={handleExportCsv}>
            Xuất Manifest CSV
          </button>

          <button type="button" className={styles.btnOutline} onClick={openEditModal}>
            Sửa thông tin
          </button>

          {trip.status !== TRIP_STATUS.COMPLETED && trip.status !== TRIP_STATUS.CANCELLED && (
            <button type="button" className={styles.btnDanger} onClick={() => setIsCancelOpen(true)}>
              Hủy chuyến khẩn cấp
            </button>
          )}
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

      {/* Thanh điều hướng 4 Tab */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          1. Tổng quan & Readiness Checklist
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'bookings' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          2. Đơn đặt & Hành khách ({bookings.length})
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'kanban' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('kanban')}
        >
          3. Chia nhóm Kanban & Guide
        </button>
        <button
          type="button"
          className={`${styles.tabBtn} ${activeTab === 'attendance' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          4. Ma trận Điểm danh Hoạt động
        </button>
      </div>

      {/* TAB 1: Tổng quan & Readiness Checklist */}
      {activeTab === 'overview' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>
                  Checklist Sẵn sàng Khởi hành trước giờ G (Readiness Checklist)
                </h2>
                <p className={styles.subtitle}>
                  Cả 5 điều kiện tiên quyết phải đạt trạng thái Đạt mới có thể bấm Xuất phát chuyến đi.
                </p>
              </div>
              <span
                className={`${styles.badge} ${
                  readiness?.isReadyToDepart ? styles.badgePositive : styles.badgeWarning
                }`}
              >
                {readiness?.isReadyToDepart ? 'ĐỦ ĐIỀU KIỆN KHỞI HÀNH' : 'CHƯA ĐỦ ĐIỀU KIỆN'}
              </span>
            </div>

            {checklist && (
              <div className={styles.checklistGrid}>
                <div
                  className={`${styles.checkItem} ${
                    checklist.minParticipantsMet?.passed ? styles.checkItemPass : styles.checkItemFail
                  }`}
                >
                  <div>
                    <strong>1. Đạt số khách tối thiểu</strong>
                    <div className={styles.subtitle}>
                      Hiện tại: {checklist.minParticipantsMet?.current} / Tối thiểu:{' '}
                      {checklist.minParticipantsMet?.required} khách
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.checkItem} ${
                    checklist.allParticipantsGrouped?.passed ? styles.checkItemPass : styles.checkItemFail
                  }`}
                >
                  <div>
                    <strong>2. Mọi khách đã xếp nhóm</strong>
                    <div className={styles.subtitle}>
                      Chưa xếp nhóm: {checklist.allParticipantsGrouped?.unassignedCount} khách
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.checkItem} ${
                    checklist.allGroupsHaveGuides?.passed ? styles.checkItemPass : styles.checkItemFail
                  }`}
                >
                  <div>
                    <strong>3. Mọi nhóm có Hướng dẫn viên</strong>
                    <div className={styles.subtitle}>
                      Đã gán Guide: {checklist.allGroupsHaveGuides?.assignedGroups} /{' '}
                      {checklist.allGroupsHaveGuides?.totalGroups} nhóm
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.checkItem} ${
                    checklist.allProvidedItemsReady?.passed ? styles.checkItemPass : styles.checkItemFail
                  }`}
                >
                  <div>
                    <strong>4. Thiết bị cấp phát sẵn sàng</strong>
                    <div className={styles.subtitle}>
                      Hạng mục còn thiếu: {checklist.allProvidedItemsReady?.missingItemsCount}
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.checkItem} ${
                    checklist.allOrdersPaid?.passed ? styles.checkItemPass : styles.checkItemFail
                  }`}
                >
                  <div>
                    <strong>5. Toàn bộ đơn đã thanh toán</strong>
                    <div className={styles.subtitle}>
                      Đơn chưa thanh toán: {checklist.allOrdersPaid?.unpaidOrdersCount}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 16 }}>
              Thông số Vận hành & Doanh thu Dự kiến (8.3)
            </h2>
            <dl className="detail-list">
              <dt>Mã chuyến đi (TripId):</dt>
              <dd>{trip.tripId}</dd>
              <dt>Sĩ số đã đặt / Tổng chỗ:</dt>
              <dd>
                <strong>{trip.soldSlots}</strong> / {trip.totalSlots} chỗ (Còn trống: {trip.remainingSlots}{' '}
                chỗ)
              </dd>
              <dt>Sức chứa tối thiểu:</dt>
              <dd>{trip.minParticipants} khách</dd>
              <dt>Giá vé mỗi khách:</dt>
              <dd>{formatCurrency(trip.pricePerPerson)}</dd>
              <dt>Doanh thu dự kiến:</dt>
              <dd>
                <strong>{formatCurrency(trip.estimatedRevenue)}</strong>
              </dd>
              <dt>Chính sách hoàn tiền:</dt>
              <dd>{trip.refundPolicyName || trip.refundPolicyId}</dd>
              <dt>Người điều phối:</dt>
              <dd>{trip.managerFullName || 'Chưa gán'}</dd>
              <dt>Số nhóm đoàn hiện tại:</dt>
              <dd>{trip.groupsCount} nhóm</dd>
              <dt>Phiên bản dữ liệu (RowVersion):</dt>
              <dd>v{trip.rowVersion}</dd>
            </dl>
          </div>
        </>
      )}

      {/* TAB 2: O11 - Danh sách Booking & Khách */}
      {activeTab === 'bookings' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Danh sách Đơn đặt chỗ & Hành khách đi kèm (Màn O11 - 8.11)</h2>
          </div>

          {bookings.length === 0 ? (
            <p className={styles.subtitle}>Chuyến đi này chưa có đơn đặt chỗ nào.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Người đặt</th>
                    <th>Số khách</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái đơn / Thanh toán</th>
                    <th>Nguyện vọng ghép nhóm</th>
                    <th>Danh sách Hành khách & Liên hệ khẩn cấp</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.orderId}>
                      <td>
                        <strong>{b.orderCode}</strong>
                      </td>
                      <td>
                        <div>{b.customerName}</div>
                        <div className={styles.subtitle}>{b.customerEmail}</div>
                      </td>
                      <td>{b.participantCount} người</td>
                      <td>{formatCurrency(b.totalAmount)}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeInfo}`}>{b.orderStatus}</span>{' '}
                        <span
                          className={`${styles.badge} ${
                            b.paymentStatus === 'Paid' ? styles.badgePositive : styles.badgeWarning
                          }`}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <div>{b.groupingPreference}</div>
                        {b.isSplit && (
                          <span className={`${styles.badge} ${styles.badgeWarning}`}>
                            Đã duyệt tách đoàn: {b.splitReason}
                          </span>
                        )}
                      </td>
                      <td>
                        {b.participants.map((p) => (
                          <div key={p.participantId} style={{ marginBottom: 6 }}>
                            <strong>{p.fullName}</strong> ({p.phone || p.email}) —{' '}
                            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                              {p.tripGroupName || 'Chưa phân nhóm'}
                            </span>
                            {p.emergencyContactPhone && (
                              <span className={styles.subtitle}>
                                {' '}
                                · Khẩn cấp: {p.emergencyContactName} ({p.emergencyContactPhone})
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: O12 - Bảng Kanban Chia nhóm */}
      {activeTab === 'kanban' && <TripKanbanBoardTab tripId={tripId} />}

      {/* TAB 4: O14 - Ma trận Điểm danh Hoạt động */}
      {activeTab === 'attendance' && <TripAttendanceMatrixTab tripId={tripId} />}

      {/* Modal cập nhật chuyến đi (8.4) */}
      {isEditOpen && editForm && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modalCard} onSubmit={handleSaveEdit}>
            <h2 className={styles.cardTitle}>Cập nhật Chuyến đi (RowVersion v{editForm.rowVersion})</h2>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="editStart">Khởi hành</label>
                <input
                  id="editStart"
                  type="datetime-local"
                  className={styles.input}
                  value={editForm.startAt}
                  onChange={(e) => setEditForm({ ...editForm, startAt: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="editEnd">Kết thúc</label>
                <input
                  id="editEnd"
                  type="datetime-local"
                  className={styles.input}
                  value={editForm.endAt}
                  onChange={(e) => setEditForm({ ...editForm, endAt: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="editSlots">
                  Tổng sức chứa (Tối thiểu bằng số chỗ đã bán: {trip.soldSlots})
                </label>
                <input
                  id="editSlots"
                  type="number"
                  min={Math.max(1, trip.soldSlots)}
                  className={styles.input}
                  value={editForm.totalSlots}
                  onChange={(e) => setEditForm({ ...editForm, totalSlots: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="editMin">Số khách tối thiểu</label>
                <input
                  id="editMin"
                  type="number"
                  min="1"
                  className={styles.input}
                  value={editForm.minParticipants}
                  onChange={(e) => setEditForm({ ...editForm, minParticipants: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="editPrice">Giá vé / khách (VNĐ)</label>
              <input
                id="editPrice"
                type="number"
                min="0"
                step="10000"
                className={styles.input}
                value={editForm.pricePerPerson}
                onChange={(e) => setEditForm({ ...editForm, pricePerPerson: e.target.value })}
                required
              />
            </div>

            <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
              <button type="button" className={styles.btnOutline} onClick={() => setIsEditOpen(false)}>
                Hủy
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={updateTrip.isPending}>
                Lưu cập nhật
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Hủy chuyến khẩn cấp (8.10) */}
      {isCancelOpen && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modalCard} onSubmit={handleCancelTrip}>
            <h2 className={styles.cardTitle}>Xác nhận Hủy chuyến đi Khẩn cấp (8.10)</h2>
            <p className={styles.subtitle}>
              Thao tác này sẽ hủy toàn bộ booking của chuyến, tự động sinh giao dịch hoàn tiền 100% ở trạng
              thái <strong>PendingApproval</strong>, giải phóng toàn bộ thiết bị đang giữ kho và lưu nhật ký
              kiểm toán.
            </p>
            <div className={styles.field}>
              <label htmlFor="cancelReason">Lý do hủy chuyến (bắt buộc) *</label>
              <textarea
                id="cancelReason"
                className={styles.textarea}
                placeholder="VD: Thời tiết mưa bão sạt lở nguy hiểm theo cảnh báo kiểm lâm..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </div>
            <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
              <button type="button" className={styles.btnOutline} onClick={() => setIsCancelOpen(false)}>
                Đóng
              </button>
              <button type="submit" className={styles.btnDanger} disabled={cancelTrip.isPending}>
                Xác nhận Hủy chuyến
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
