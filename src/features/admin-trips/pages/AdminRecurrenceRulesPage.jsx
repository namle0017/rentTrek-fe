import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import { TableSkeleton } from '@/components/skeleton';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import {
  useCreateRecurrenceRule,
  useDeleteRecurrenceRule,
  useGenerateRecurrenceTrips,
  usePreviewRecurrenceTrips,
  useRecurrenceRules,
  useUpdateRecurrenceRule,
} from '../hooks/useAdminTrips';
import styles from './AdminTripOps.module.css';

const DAYS_OPTIONS = [
  { value: 'Monday', label: 'Thứ 2' },
  { value: 'Tuesday', label: 'Thứ 3' },
  { value: 'Wednesday', label: 'Thứ 4' },
  { value: 'Thursday', label: 'Thứ 5' },
  { value: 'Friday', label: 'Thứ 6' },
  { value: 'Saturday', label: 'Thứ 7' },
  { value: 'Sunday', label: 'Chủ nhật' },
];

const INITIAL_FORM = {
  frequency: 'Weekly',
  intervalValue: 1,
  daysOfWeek: 'Friday,Saturday',
  startTime: '06:00:00',
  startDate: '2026-12-01',
  endDate: '2027-02-28',
  defaultTotalSlots: 20,
  defaultPrice: 3200000,
  isActive: true,
};

export default function AdminRecurrenceRulesPage() {
  const { tourId } = useParams();
  const { data: rules = [], isLoading, isError, error, refetch } = useRecurrenceRules(tourId);
  const createRule = useCreateRecurrenceRule(tourId);
  const updateRule = useUpdateRecurrenceRule(tourId);
  const deleteRule = useDeleteRecurrenceRule(tourId);
  const previewMutation = usePreviewRecurrenceTrips();
  const generateMutation = useGenerateRecurrenceTrips(tourId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [previewItems, setPreviewItems] = useState(null);
  const [activePreviewRuleId, setActivePreviewRuleId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const openCreateModal = () => {
    setEditingRuleId(null);
    setForm(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRuleId(rule.recurrenceRuleId);
    setForm({
      frequency: rule.frequency,
      intervalValue: rule.intervalValue,
      daysOfWeek: rule.daysOfWeek ?? '',
      startTime: rule.startTime ?? '06:00:00',
      startDate: rule.startDate,
      endDate: rule.endDate ?? '',
      defaultTotalSlots: rule.defaultTotalSlots,
      defaultPrice: rule.defaultPrice ?? 0,
      isActive: rule.isActive,
    });
    setIsModalOpen(true);
  };

  const toggleDay = (dayValue) => {
    const current = (form.daysOfWeek || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const next = current.includes(dayValue) ? current.filter((d) => d !== dayValue) : [...current, dayValue];
    setForm((prev) => ({ ...prev, daysOfWeek: next.join(',') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    const payload = {
      ...form,
      intervalValue: Number(form.intervalValue),
      defaultTotalSlots: Number(form.defaultTotalSlots),
      defaultPrice: Number(form.defaultPrice),
      endDate: form.endDate || null,
    };

    try {
      if (editingRuleId) {
        await updateRule.mutateAsync({ ruleId: editingRuleId, payload });
        setFeedback({ type: 'success', text: 'Đã cập nhật quy tắc lặp chuyến thành công.' });
      } else {
        await createRule.mutateAsync(payload);
        setFeedback({ type: 'success', text: 'Đã tạo quy tắc lặp chuyến mới thành công.' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể lưu quy tắc lặp.' });
    }
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quy tắc lặp này?')) return;
    setFeedback(null);
    try {
      await deleteRule.mutateAsync(ruleId);
      setFeedback({ type: 'success', text: 'Đã xóa quy tắc lặp chuyến.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể xóa quy tắc lặp.' });
    }
  };

  const handlePreview = async (ruleId) => {
    setFeedback(null);
    try {
      const res = await previewMutation.mutateAsync({ ruleId, payload: {} });
      setActivePreviewRuleId(ruleId);
      setPreviewItems(res.data ?? []);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể xem trước lịch sinh chuyến.' });
    }
  };

  const handleGenerate = async (ruleId) => {
    setFeedback(null);
    try {
      const res = await generateMutation.mutateAsync({ ruleId, payload: {} });
      const data = res.data;
      setFeedback({
        type: 'success',
        text: `Đã sinh tự động ${data?.createdCount ?? 0} chuyến mới (bỏ qua ${data?.skippedCount ?? 0} ngày đã tồn tại).`,
      });
      if (activePreviewRuleId === ruleId) {
        handlePreview(ruleId);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể sinh chuyến tự động.' });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <Breadcrumb
            items={[
              { label: 'Quản lý Chuyến đi', to: ROUTES.ADMIN_TRIPS },
              { label: 'Lịch lặp Tour' },
            ]}
          />
          <h1 className={styles.pageTitle}>Quy tắc Lịch lặp & Tự động sinh chuyến</h1>
          <p className={styles.subtitle}>Mã Tour: {tourId}</p>
        </div>

        <div className={styles.actionRow}>
          <Link to={ROUTES.ADMIN_TRIPS} className={styles.btnOutline}>
            ← Danh sách Chuyến đi
          </Link>
          <button type="button" className={styles.btnAccent} onClick={openCreateModal}>
            + Tạo quy tắc lặp mới
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
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Danh sách Quy tắc lặp ({rules.length})</h2>
        </div>

        {rules.length === 0 ? (
          <p className={styles.subtitle}>
            Tour này chưa có quy tắc lặp nào. Hãy nhấn &ldquo;+ Tạo quy tắc lặp mới&rdquo; để thiết lập.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tần suất</th>
                  <th>Ngày trong tuần</th>
                  <th>Giờ xuất phát</th>
                  <th>Hiệu lực</th>
                  <th>Số chỗ mặc định</th>
                  <th>Giá mặc định</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.recurrenceRuleId}>
                    <td>
                      <strong>{rule.frequency}</strong> (mỗi {rule.intervalValue})
                    </td>
                    <td>{rule.daysOfWeek || 'Theo ngày bắt đầu'}</td>
                    <td>{rule.startTime}</td>
                    <td>
                      {rule.startDate} → {rule.endDate || 'Không giới hạn'}
                    </td>
                    <td>{rule.defaultTotalSlots} chỗ</td>
                    <td>{formatCurrency(rule.defaultPrice ?? 0)}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          rule.isActive ? styles.badgePositive : styles.badgeNeutral
                        }`}
                      >
                        {rule.isActive ? 'Đang kích hoạt' : 'Tạm ngưng'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionRow}>
                        <button
                          type="button"
                          className={`${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() => handlePreview(rule.recurrenceRuleId)}
                          disabled={previewMutation.isPending}
                        >
                          Xem trước (Preview)
                        </button>
                        <button
                          type="button"
                          className={`${styles.btnPrimary} ${styles.btnSm}`}
                          onClick={() => handleGenerate(rule.recurrenceRuleId)}
                          disabled={generateMutation.isPending || !rule.isActive}
                        >
                          Sinh chuyến ngay
                        </button>
                        <button
                          type="button"
                          className={`${styles.btnOutline} ${styles.btnSm}`}
                          onClick={() => openEditModal(rule)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className={`${styles.btnDanger} ${styles.btnSm}`}
                          onClick={() => handleDelete(rule.recurrenceRuleId)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewItems && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              Xem trước các chuyến sẽ sinh ({previewItems.length} lịch khởi hành)
            </h2>
            <button
              type="button"
              className={`${styles.btnOutline} ${styles.btnSm}`}
              onClick={() => setPreviewItems(null)}
            >
              Đóng xem trước
            </button>
          </div>

          {previewItems.length === 0 ? (
            <p className={styles.subtitle}>Không có ngày khởi hành nào khớp trong khoảng thời gian này.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Khởi hành (StartAt)</th>
                    <th>Kết thúc (EndAt)</th>
                    <th>Trạng thái sinh chuyến</th>
                  </tr>
                </thead>
                <tbody>
                  {previewItems.map((item, idx) => (
                    <tr key={item.startAt}>
                      <td>{idx + 1}</td>
                      <td>{formatDate(item.startAt)}</td>
                      <td>{formatDate(item.endAt)}</td>
                      <td>
                        {item.isAlreadyGenerated ? (
                          <span className={`${styles.badge} ${styles.badgeWarning}`}>
                            Đã tồn tại chuyến ({item.existingTripId?.slice(0, 8)})
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgePositive}`}>Sẵn sàng sinh mới</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modalCard} onSubmit={handleSubmit}>
            <h2 className={styles.cardTitle}>
              {editingRuleId ? 'Cập nhật Quy tắc lặp chuyến' : 'Tạo Quy tắc lặp chuyến mới'}
            </h2>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="freq">Tần suất lặp</label>
                <select
                  id="freq"
                  className={styles.select}
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                >
                  <option value="Weekly">Hằng tuần (Weekly)</option>
                  <option value="Daily">Hằng ngày (Daily)</option>
                  <option value="Monthly">Hằng tháng (Monthly)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="interval">Khoảng lặp (Interval)</label>
                <input
                  id="interval"
                  type="number"
                  min="1"
                  className={styles.input}
                  value={form.intervalValue}
                  onChange={(e) => setForm({ ...form, intervalValue: e.target.value })}
                  required
                />
              </div>
            </div>

            {form.frequency === 'Weekly' && (
              <div className={styles.field}>
                <label>Chọn các thứ khởi hành trong tuần</label>
                <div className={styles.actionRow}>
                  {DAYS_OPTIONS.map((day) => {
                    const selected = (form.daysOfWeek || '')
                      .split(',')
                      .map((s) => s.trim())
                      .includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        className={`${selected ? styles.btnPrimary : styles.btnOutline} ${styles.btnSm}`}
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="startTime">Giờ tập trung (HH:mm:ss)</label>
                <input
                  id="startTime"
                  type="text"
                  className={styles.input}
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="slots">Tổng chỗ mặc định</label>
                <input
                  id="slots"
                  type="number"
                  min="1"
                  className={styles.input}
                  value={form.defaultTotalSlots}
                  onChange={(e) => setForm({ ...form, defaultTotalSlots: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="startDate">Từ ngày</label>
                <input
                  id="startDate"
                  type="date"
                  className={styles.input}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="endDate">Đến ngày</label>
                <input
                  id="endDate"
                  type="date"
                  className={styles.input}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="defaultPrice">Giá mặc định / khách (VNĐ)</label>
                <input
                  id="defaultPrice"
                  type="number"
                  min="0"
                  step="10000"
                  className={styles.input}
                  value={form.defaultPrice}
                  onChange={(e) => setForm({ ...form, defaultPrice: e.target.value })}
                  required
                />
              </div>

              <div className={styles.field}>
                <label>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />{' '}
                  Kích hoạt quy tắc này
                </label>
              </div>
            </div>

            <div className={styles.actionRow} style={{ justifyContent: 'flex-end' }}>
              <button type="button" className={styles.btnOutline} onClick={() => setIsModalOpen(false)}>
                Hủy
              </button>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={createRule.isPending || updateRule.isPending}
              >
                Lưu quy tắc
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
