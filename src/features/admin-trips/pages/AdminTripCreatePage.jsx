import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Breadcrumb from '@/components/Breadcrumb';
import { FormSkeleton } from '@/components/skeleton';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import {
  useActiveRefundPolicies,
  useCreateAdminTrip,
  usePublishedTours,
  useTripCoordinators,
} from '../hooks/useAdminTrips';
import styles from './AdminTripOps.module.css';

export default function AdminTripCreatePage() {
  const navigate = useNavigate();

  const { data: publishedTours = [], isLoading: loadingTours } = usePublishedTours();
  const { data: refundPolicies = [], isLoading: loadingPolicies } = useActiveRefundPolicies();
  const { data: coordinators = [], isLoading: loadingCoordinators } = useTripCoordinators();

  const createTrip = useCreateAdminTrip();

  const [form, setForm] = useState({
    tourId: '',
    refundPolicyId: '',
    managedByUserId: '',
    startAt: '',
    endAt: '',
    totalSlots: 15,
    minParticipants: 8,
    pricePerPerson: 0,
  });

  const [errors, setErrors] = useState({});
  const [selectedTour, setSelectedTour] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Khi chọn Tour: tự động điền giá vé, sức chứa chuẩn từ Tour và gợi ý endAt nếu đã có startAt
  const handleTourChange = (e) => {
    const tourId = e.target.value;
    const tour = publishedTours.find((t) => t.tourId === tourId) || null;
    setSelectedTour(tour);

    setForm((prev) => {
      let nextEnd = prev.endAt;
      if (prev.startAt && tour?.durationDays) {
        const startDate = dayjs(prev.startAt);
        if (startDate.isValid()) {
          const daysToAdd = Math.max(0, tour.durationDays - 1);
          nextEnd = startDate.add(daysToAdd, 'day').hour(18).minute(0).second(0).format('YYYY-MM-DDTHH:mm');
        }
      }

      return {
        ...prev,
        tourId,
        pricePerPerson: tour ? tour.basePrice : 0,
        totalSlots: tour?.maxParticipants || prev.totalSlots || 15,
        minParticipants: tour?.minParticipants || prev.minParticipants || 8,
        endAt: nextEnd,
      };
    });

    if (errors.tourId) {
      setErrors((prev) => ({ ...prev, tourId: '' }));
    }
  };

  // Khi thay đổi startAt: tự động tính và cập nhật endAt theo durationDays của Tour
  const handleStartAtChange = (e) => {
    const startVal = e.target.value;
    setForm((prev) => {
      let nextEnd = prev.endAt;
      if (startVal && selectedTour?.durationDays) {
        const startDate = dayjs(startVal);
        if (startDate.isValid()) {
          const daysToAdd = Math.max(0, selectedTour.durationDays - 1);
          nextEnd = startDate.add(daysToAdd, 'day').hour(18).minute(0).second(0).format('YYYY-MM-DDTHH:mm');
        }
      }
      return {
        ...prev,
        startAt: startVal,
        endAt: nextEnd,
      };
    });

    if (errors.startAt) {
      setErrors((prev) => ({ ...prev, startAt: '' }));
    }
    if (errors.endAt) {
      setErrors((prev) => ({ ...prev, endAt: '' }));
    }
  };

  // Nút tính lại endAt thủ công theo thời lượng Tour
  const handleRecalculateEndAt = () => {
    if (!form.startAt || !selectedTour?.durationDays) return;
    const startDate = dayjs(form.startAt);
    if (startDate.isValid()) {
      const daysToAdd = Math.max(0, selectedTour.durationDays - 1);
      const autoEnd = startDate.add(daysToAdd, 'day').hour(18).minute(0).second(0).format('YYYY-MM-DDTHH:mm');
      setForm((prev) => ({ ...prev, endAt: autoEnd }));
      setErrors((prev) => ({ ...prev, endAt: '' }));
    }
  };

  // Kiểm tra tính hợp lệ của toàn bộ form theo thời gian thực
  const validateForm = () => {
    const nextErrors = {};

    if (!form.tourId) {
      nextErrors.tourId = 'Vui lòng chọn Tour đã phát hành.';
    }

    if (!form.refundPolicyId) {
      nextErrors.refundPolicyId = 'Vui lòng chọn Chính sách hoàn tiền.';
    }

    if (!form.startAt) {
      nextErrors.startAt = 'Vui lòng chọn thời điểm khởi hành.';
    }

    if (!form.endAt) {
      nextErrors.endAt = 'Vui lòng chọn thời điểm kết thúc.';
    } else if (form.startAt && new Date(form.endAt) <= new Date(form.startAt)) {
      nextErrors.endAt = 'Thời điểm kết thúc phải sau thời điểm khởi hành.';
    }

    if (!form.totalSlots || Number(form.totalSlots) <= 0) {
      nextErrors.totalSlots = 'Tổng sức chứa phải lớn hơn 0.';
    }

    if (!form.minParticipants || Number(form.minParticipants) <= 0) {
      nextErrors.minParticipants = 'Số khách tối thiểu phải lớn hơn 0.';
    } else if (Number(form.minParticipants) > Number(form.totalSlots)) {
      nextErrors.minParticipants = `Số khách tối thiểu không được vượt quá tổng sức chứa (${form.totalSlots}).`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Bấm Xem lại trước khi tạo
  const handleOpenReview = (e) => {
    e.preventDefault();
    setFeedback(null);
    const isValid = validateForm();
    if (!isValid) {
      setFeedback({
        type: 'error',
        text: 'Vui lòng kiểm tra và sửa các trường thông tin chưa hợp lệ bên dưới.',
      });
      return;
    }
    setIsReviewOpen(true);
  };

  // Xác nhận tạo chuyến từ Review Modal
  const handleConfirmCreate = async () => {
    setFeedback(null);
    try {
      await createTrip.mutateAsync({
        tourId: form.tourId,
        refundPolicyId: form.refundPolicyId,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        totalSlots: Number(form.totalSlots),
        minParticipants: Number(form.minParticipants),
        pricePerPerson: Number(form.pricePerPerson),
        managedByUserId: form.managedByUserId || null,
      });

      setIsReviewOpen(false);
      navigate(ROUTES.ADMIN_TRIPS);
    } catch (err) {
      setIsReviewOpen(false);
      setFeedback({ type: 'error', text: err.message || 'Không thể tạo chuyến đi mới.' });
    }
  };

  const selectedPolicy = refundPolicies.find((p) => p.refundPolicyId === form.refundPolicyId);
  const selectedCoordinator = coordinators.find((c) => c.userId === form.managedByUserId);

  if (loadingTours || loadingPolicies || loadingCoordinators) {
    return (
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <Breadcrumb
              items={[
                { label: 'Quản lý chuyến đi', to: ROUTES.ADMIN_TRIPS },
                { label: 'Thêm chuyến đi mới' },
              ]}
            />
          </div>
        </div>
        <FormSkeleton fields={6} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header trang và nút Quay lại danh sách */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <Breadcrumb
            items={[
              { label: 'Quản lý chuyến đi', to: ROUTES.ADMIN_TRIPS },
              { label: 'Thêm chuyến đi mới' },
            ]}
          />
        </div>

        <div className={styles.actionRow}>
          <Link to={ROUTES.ADMIN_TRIPS} className={styles.btnOutline}>
            ← Quay lại danh sách
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          className={`${styles.alertBanner} ${
            feedback.type === 'error' ? styles.alertError : styles.alertSuccess
          }`}
          style={{ marginBottom: 20 }}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleOpenReview} className={styles.unifiedFormContainer}>
        {/* ====================================================================
            NHÓM 1: THÔNG TIN CHUYẾN ĐI & TOUR
           ==================================================================== */}
        <div className={styles.unifiedSection}>
          <div className={styles.unifiedSectionHeader}>
            <h2 className={styles.sectionTitle}>1. Thông tin chuyến đi & Tour Trekking</h2>
            <p className={styles.sectionSubtitle}>
              Chọn Tour đã phát hành để kế thừa giá vé cơ sở, chính sách hoàn tiền và thông số kỹ thuật.
            </p>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.field} style={{ flex: 2 }}>
              <label htmlFor="tourSelect">Tour Trekking (Đã phát hành) *</label>
              <select
                id="tourSelect"
                className={`${styles.select} ${errors.tourId ? styles.inputError : ''}`}
                value={form.tourId}
                onChange={handleTourChange}
              >
                <option value="">-- Chọn Tour đã phát hành --</option>
                {publishedTours.map((t) => (
                  <option key={t.tourId} value={t.tourId}>
                    [{t.tourCode || t.tourId}] {t.title} ({t.durationDays}N{t.durationNights}Đ) - Giá:{' '}
                    {formatCurrency(t.basePrice)}
                  </option>
                ))}
              </select>
              {errors.tourId && <span className={styles.fieldError}>{errors.tourId}</span>}
            </div>

            <div className={styles.field} style={{ flex: 1 }}>
              <label htmlFor="pricePerPerson">Giá mỗi khách (VNĐ)</label>
              <input
                id="pricePerPerson"
                type="text"
                className={`${styles.input} ${styles.inputReadOnly}`}
                value={formatCurrency(form.pricePerPerson)}
                readOnly
                disabled
              />
              <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b', marginTop: '4px' }}>
                Giá vé cố định từ Tour đã chọn (không chỉnh sửa thủ công)
              </span>
            </div>
          </div>

          {/* Hộp xem trước thông tin Tour đã chọn */}
          {selectedTour && (
            <div className={styles.tourPreviewCard}>
              <div className={styles.tourPreviewItem}>
                <span className={styles.tourPreviewLabel}>Mã Tour</span>
                <span className={styles.tourPreviewValue}>
                  {selectedTour.tourCode || selectedTour.tourId}
                </span>
              </div>
              <div className={styles.tourPreviewItem}>
                <span className={styles.tourPreviewLabel}>Địa điểm</span>
                <span className={styles.tourPreviewValue}>{selectedTour.location || 'Chưa cập nhật'}</span>
              </div>
              <div className={styles.tourPreviewItem}>
                <span className={styles.tourPreviewLabel}>Độ khó</span>
                <span className={styles.tourPreviewValue}>{selectedTour.difficulty || 'Trung bình'}</span>
              </div>
              <div className={styles.tourPreviewItem}>
                <span className={styles.tourPreviewLabel}>Thời lượng</span>
                <span className={styles.tourPreviewValue}>
                  {selectedTour.durationDays} ngày {selectedTour.durationNights} đêm
                </span>
              </div>
            </div>
          )}

          <div className={styles.filterBar}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label htmlFor="policySelect">Chính sách hoàn tiền (Đang hoạt động) *</label>
              <select
                id="policySelect"
                className={`${styles.select} ${errors.refundPolicyId ? styles.inputError : ''}`}
                value={form.refundPolicyId}
                onChange={(e) => {
                  setForm({ ...form, refundPolicyId: e.target.value });
                  if (errors.refundPolicyId) setErrors((prev) => ({ ...prev, refundPolicyId: '' }));
                }}
              >
                <option value="">-- Chọn chính sách hoàn tiền --</option>
                {refundPolicies.map((p) => (
                  <option key={p.refundPolicyId} value={p.refundPolicyId}>
                    [{p.policyCode || p.refundPolicyId}] {p.policyName}
                  </option>
                ))}
              </select>
              {errors.refundPolicyId && <span className={styles.fieldError}>{errors.refundPolicyId}</span>}
            </div>
          </div>
        </div>

        {/* ====================================================================
            NHÓM 2: LỊCH TRÌNH & ĐIỀU PHỐI
           ==================================================================== */}
        <div className={styles.unifiedSection}>
          <div className={styles.unifiedSectionHeader}>
            <h2 className={styles.sectionTitle}>2. Lịch trình & Điều phối đoàn</h2>
            <p className={styles.sectionSubtitle}>
              Xác định mốc khởi hành, thời điểm kết thúc và gán nhân sự phụ trách điều hành đoàn.
            </p>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.field}>
              <label htmlFor="startAt">Thời điểm khởi hành *</label>
              <input
                id="startAt"
                type="datetime-local"
                className={`${styles.input} ${errors.startAt ? styles.inputError : ''}`}
                value={form.startAt}
                onChange={handleStartAtChange}
              />
              {errors.startAt && <span className={styles.fieldError}>{errors.startAt}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="endAt">Thời điểm kết thúc *</label>
              <input
                id="endAt"
                type="datetime-local"
                className={`${styles.input} ${errors.endAt ? styles.inputError : ''}`}
                value={form.endAt}
                onChange={(e) => {
                  setForm({ ...form, endAt: e.target.value });
                  if (errors.endAt) setErrors((prev) => ({ ...prev, endAt: '' }));
                }}
              />
              {errors.endAt && <span className={styles.fieldError}>{errors.endAt}</span>}
              {selectedTour?.durationDays && form.startAt && (
                <button
                  type="button"
                  className={styles.autoCalcHint}
                  onClick={handleRecalculateEndAt}
                  title="Tự động tính ngày và đặt giờ kết thúc 18:00 theo thời lượng tour"
                >
                  Tự động đặt giờ kết thúc theo thời lượng Tour ({selectedTour.durationDays}N
                  {selectedTour.durationNights}Đ)
                </button>
              )}
            </div>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.field} style={{ flex: 1 }}>
              <label htmlFor="coordinatorSelect">Người điều phối chuyến đi</label>
              <select
                id="coordinatorSelect"
                className={styles.select}
                value={form.managedByUserId}
                onChange={(e) => setForm({ ...form, managedByUserId: e.target.value })}
              >
                <option value="">-- Chưa gán người điều phối --</option>
                {coordinators.map((c) => (
                  <option key={c.userId} value={c.userId}>
                    {c.fullName} ({c.role}) - {c.email}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b', marginTop: '4px' }}>
                Có thể phân công sau trong giao diện Quản lý chi tiết & Chia nhóm Hướng dẫn viên
              </span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            NHÓM 3: SỨC CHỨA & ĐIỀU KIỆN KHỞI HÀNH
           ==================================================================== */}
        <div className={styles.unifiedSection}>
          <div className={styles.unifiedSectionHeader}>
            <h2 className={styles.sectionTitle}>3. Sức chứa & Điều kiện khởi hành</h2>
            <p className={styles.sectionSubtitle}>
              Thiết lập ngưỡng sĩ số tối thiểu để kích hoạt chuyến đi và giới hạn số chỗ tối đa nhận khách.
            </p>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.field}>
              <label htmlFor="totalSlots">Tổng sức chứa tối đa (Slots) *</label>
              <input
                id="totalSlots"
                type="number"
                min="1"
                className={`${styles.input} ${errors.totalSlots ? styles.inputError : ''}`}
                value={form.totalSlots}
                onChange={(e) => {
                  setForm({ ...form, totalSlots: Number(e.target.value) });
                  if (errors.totalSlots) setErrors((prev) => ({ ...prev, totalSlots: '' }));
                }}
              />
              {errors.totalSlots && <span className={styles.fieldError}>{errors.totalSlots}</span>}
              <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b', marginTop: '4px' }}>
                Tự động điền theo sức chứa tối đa thiết kế của Tour
              </span>
            </div>

            <div className={styles.field}>
              <label htmlFor="minParticipants">Số khách tối thiểu để khởi hành *</label>
              <input
                id="minParticipants"
                type="number"
                min="1"
                max={form.totalSlots}
                className={`${styles.input} ${errors.minParticipants ? styles.inputError : ''}`}
                value={form.minParticipants}
                onChange={(e) => {
                  setForm({ ...form, minParticipants: Number(e.target.value) });
                  if (errors.minParticipants) setErrors((prev) => ({ ...prev, minParticipants: '' }));
                }}
              />
              {errors.minParticipants && <span className={styles.fieldError}>{errors.minParticipants}</span>}
              <span style={{ fontSize: "var(--font-size-meta)", color: '#64748b', marginTop: '4px' }}>
                Nếu không đạt sĩ số tối thiểu trước ngày chốt đoàn, hệ thống sẽ cảnh báo sĩ số
              </span>
            </div>
          </div>
        </div>

        {/* Nút thao tác dưới cùng form */}
        <div className={styles.actionRow} style={{ justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Link to={ROUTES.ADMIN_TRIPS} className={styles.btnOutline}>
            Hủy bỏ
          </Link>
          <button type="submit" className={styles.btnPrimary}>
            Xem lại & Xác nhận tạo chuyến →
          </button>
        </div>
      </form>

      {/* ====================================================================
          MODAL XEM LẠI & XÁC NHẬN TRƯỚC KHI TẠO CHUYẾN ĐI
         ==================================================================== */}
      {isReviewOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard} style={{ maxWidth: 600 }}>
            <div>
              <h2 className={styles.cardTitle} style={{ fontSize: "var(--font-size-section-title)" }}>
                Xác nhận tạo chuyến đi mới
              </h2>
              <p className={styles.subtitle} style={{ marginTop: 4 }}>
                Vui lòng kiểm tra lại toàn bộ thông số vận hành trước khi lưu vào hệ thống.
              </p>
            </div>

            <div className={styles.reviewSummaryList}>
              <div className={styles.reviewSummaryRow}>
                <span className={styles.reviewSummaryLabel}>Tour Trekking:</span>
                <span className={styles.reviewSummaryValue}>
                  {selectedTour?.title || form.tourId} ({selectedTour?.durationDays}N
                  {selectedTour?.durationNights}Đ)
                </span>
              </div>

              <div className={styles.reviewSummaryRow}>
                <span className={styles.reviewSummaryLabel}>Giá vé mỗi khách:</span>
                <span className={styles.reviewSummaryValue}>{formatCurrency(form.pricePerPerson)}</span>
              </div>

              <div className={styles.reviewSummaryRow}>
                <span className={styles.reviewSummaryLabel}>Chính sách hoàn tiền:</span>
                <span className={styles.reviewSummaryValue}>
                  {selectedPolicy?.policyName || form.refundPolicyId}
                </span>
              </div>

              <div className={styles.reviewSummaryRow}>
                <span className={styles.reviewSummaryLabel}>Khởi hành:</span>
                <span className={styles.reviewSummaryValue}>{formatDateTime(form.startAt)}</span>
              </div>

              <div className={styles.reviewSummaryRow}>
                <span className={styles.reviewSummaryLabel}>Kết thúc:</span>
                <span className={styles.reviewSummaryValue}>{formatDateTime(form.endAt)}</span>
              </div>

              <div className={styles.reviewSummaryRow}>
                <span className={styles.reviewSummaryLabel}>Người điều phối:</span>
                <span className={styles.reviewSummaryValue}>
                  {selectedCoordinator
                    ? `${selectedCoordinator.fullName} (${selectedCoordinator.email})`
                    : 'Chưa gán'}
                </span>
              </div>

              <div className={styles.reviewSummaryRow}>
                <span className={styles.reviewSummaryLabel}>Sức chứa đoàn:</span>
                <span className={styles.reviewSummaryValue}>
                  Tối thiểu {form.minParticipants} khách — Tối đa {form.totalSlots} chỗ
                </span>
              </div>
            </div>

            <div className={styles.actionRow} style={{ justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={() => setIsReviewOpen(false)}
                disabled={createTrip.isPending}
              >
                Quay lại chỉnh sửa
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleConfirmCreate}
                disabled={createTrip.isPending}
              >
                {createTrip.isPending ? 'Đang tạo...' : 'Xác nhận tạo chuyến đi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
