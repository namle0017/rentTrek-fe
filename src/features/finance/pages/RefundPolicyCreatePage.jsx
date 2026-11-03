import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REFUND_POLICY_TYPE, REFUND_POLICY_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useCreateRefundPolicy } from '../hooks/useRefundPolicies';
import DynamicRuleBuilder from '../components/DynamicRuleBuilder';
import PolicyCompactTimeline from '../components/PolicyCompactTimeline';
import styles from '../components/finance.module.css';

const DEFAULT_INITIAL_RULES = [
  {
    ruleId: 'rule-init-1',
    minHoursBefore: 168,
    refundPercentage: 100,
    description: 'Trước 7 ngày (≥ 168h): Hoàn 100% tiền dịch vụ',
  },
  {
    ruleId: 'rule-init-2',
    minHoursBefore: 72,
    refundPercentage: 80,
    description: 'Từ 3 đến 7 ngày (72h - 168h): Hoàn 80% tiền dịch vụ',
  },
  {
    ruleId: 'rule-init-3',
    minHoursBefore: 24,
    refundPercentage: 50,
    description: 'Từ 24h đến 72h: Hoàn 50% tiền dịch vụ',
  },
  {
    ruleId: 'rule-init-4',
    minHoursBefore: 0,
    refundPercentage: 0,
    description: 'Dưới 24h trước khởi hành: Không hoàn tiền (0%)',
  },
];

export default function RefundPolicyCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateRefundPolicy();

  const [name, setName] = useState('');
  const [policyType, setPolicyType] = useState(REFUND_POLICY_TYPE.TOUR);
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [isPermanent, setIsPermanent] = useState(true);
  const [effectiveUntil, setEffectiveUntil] = useState('');
  const [rules, setRules] = useState(DEFAULT_INITIAL_RULES);
  const [error, setError] = useState('');

  const handleRuleChange = (index, field, value) => {
    setRules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRule = () => {
    setRules((prev) => [
      ...prev,
      {
        ruleId: `rule-${Date.now()}`,
        minHoursBefore: 48,
        refundPercentage: 60,
        description: '',
      },
    ]);
  };

  const handleRemoveRule = (index) => {
    if (rules.length <= 1) {
      alert('Chính sách cần có ít nhất 1 mốc quy tắc.');
      return;
    }
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  // Các điều kiện kiểm tra tính hợp lệ của Form (Real-time Inline Validation)
  const isNameValid = name.trim().length >= 3;
  const hasRules = rules.length >= 1;
  const isHoursValid = rules.every((r) => !isNaN(Number(r.minHoursBefore)) && Number(r.minHoursBefore) >= 0);
  const isPctValid = rules.every(
    (r) =>
      !isNaN(Number(r.refundPercentage)) &&
      Number(r.refundPercentage) >= 0 &&
      Number(r.refundPercentage) <= 100,
  );
  const isDescValid = rules.every((r) => Boolean(r.description?.trim()));
  const isFormValid = isNameValid && hasRules && isHoursValid && isPctValid && isDescValid;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Vui lòng kiểm tra lại danh sách các tiêu chí chưa hợp lệ bên cột xem trước.');
      return;
    }

    setError('');

    const formattedRules = [...rules]
      .map((r) => ({
        ruleId: r.ruleId,
        minHoursBefore: Number(r.minHoursBefore),
        refundPercentage: Number(r.refundPercentage),
        description: r.description.trim(),
      }))
      .sort((a, b) => b.minHoursBefore - a.minHoursBefore);

    const payload = {
      name: name.trim(),
      policyType,
      effectiveFrom: effectiveFrom || new Date().toISOString().split('T')[0],
      effectiveUntil: isPermanent || !effectiveUntil ? null : effectiveUntil,
      rules: formattedRules,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        navigate(ROUTES.OPS_REFUND_POLICIES);
      },
    });
  };

  return (
    <div className={styles.container}>
      {/* Tiêu đề trang & Quay lại */}
      <div className={styles.pageHeader}>
        <div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: 13, padding: '5px 12px', marginBottom: 8 }}
            onClick={() => navigate(ROUTES.OPS_REFUND_POLICIES)}
          >
            ← Quay lại danh sách
          </button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--color-text)' }}>
            Tạo Mới Chính Sách Hoàn Tiền
          </h2>
          <p className={styles.pageSubtitle} style={{ marginTop: 4 }}>
            Định nghĩa bậc thang hoàn tiền theo mốc thời gian khách hàng gửi yêu cầu hủy tour / hủy thuê
          </p>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Structured Form 2 cột */}
      <form onSubmit={handleSubmit} className={styles.structuredLayout}>
        {/* Cột Trái (60%): Thông tin cơ bản & Dynamic Rule Builder */}
        <div className={styles.formLeftCol}>
          {/* Card 1: Thông tin cơ bản */}
          <div className={styles.tableCard} style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
              1. Thông Tin Cơ Bản Chính Sách
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className={styles.filterLabel} style={{ marginBottom: 6 }}>
                  Tên chính sách <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.filterInput}
                  placeholder="Ví dụ: Chính sách hoàn hủy Tour Tiêu Chuẩn 2026..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    borderColor: name && !isNameValid ? '#dc2626' : undefined,
                  }}
                  required
                />
                {!isNameValid && name.length > 0 && (
                  <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>
                    Tên chính sách cần ít nhất 3 ký tự.
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                }}
              >
                <div>
                  <label className={styles.filterLabel} style={{ marginBottom: 6 }}>
                    Loại hình áp dụng
                  </label>
                  <select
                    className={styles.filterSelect}
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value)}
                  >
                    <option value={REFUND_POLICY_TYPE.TOUR}>
                      {REFUND_POLICY_TYPE_LABEL[REFUND_POLICY_TYPE.TOUR]}
                    </option>
                    <option value={REFUND_POLICY_TYPE.RENTAL}>
                      {REFUND_POLICY_TYPE_LABEL[REFUND_POLICY_TYPE.RENTAL]}
                    </option>
                  </select>
                </div>

                <div>
                  <label className={styles.filterLabel} style={{ marginBottom: 6 }}>
                    Ngày bắt đầu hiệu lực
                  </label>
                  <input
                    type="date"
                    className={styles.filterInput}
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={styles.filterLabel} style={{ marginBottom: 6 }}>
                  Thời hạn kết thúc
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <label
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={isPermanent}
                      onChange={(e) => {
                        setIsPermanent(e.target.checked);
                        if (e.target.checked) setEffectiveUntil('');
                      }}
                    />
                    <strong style={{ color: isPermanent ? '#16a34a' : 'inherit' }}>
                      Hiệu lực vĩnh viễn (Không có ngày kết thúc)
                    </strong>
                  </label>

                  {!isPermanent && (
                    <input
                      type="date"
                      className={styles.filterInput}
                      value={effectiveUntil}
                      onChange={(e) => setEffectiveUntil(e.target.value)}
                      placeholder="Chọn ngày kết thúc"
                      style={{ maxWidth: 220 }}
                      min={effectiveFrom}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dynamic Rule Builder */}
          <div className={styles.tableCard} style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>
              2. Bậc Thang Tỷ Lệ Hoàn Tiền (Dynamic Rule Builder)
            </h3>

            <DynamicRuleBuilder
              rules={rules}
              onChangeRule={handleRuleChange}
              onAddRule={handleAddRule}
              onRemoveRule={handleRemoveRule}
            />
          </div>
        </div>

        {/* Cột Phải (40% - Sticky): Live Preview & Validation Checklist */}
        <div className={styles.formRightCol}>
          {/* Card Xem trước khách hàng thời gian thực (Live Preview) */}
          <div className={styles.stickyPreviewCard}>
            <div className={styles.previewHeader}>
              <h4 className={styles.previewTitle}>Xem Trước (Live Preview)</h4>
              <div className={styles.previewMetaRow}>
                <span>{name || 'Chính sách mới (Chưa đặt tên)'}</span>
                <span>{REFUND_POLICY_TYPE_LABEL[policyType]}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                Hiệu lực: {effectiveFrom} → {isPermanent || !effectiveUntil ? 'Vĩnh viễn' : effectiveUntil}
              </div>
            </div>

            {/* Compact timeline xem trước */}
            <PolicyCompactTimeline rules={rules} policyName={name || 'Bản xem trước'} />

            {/* Checklist kiểm tra tính hợp lệ trước khi bấm Lưu */}
            <div className={styles.checklistCard}>
              <div className={styles.checklistTitle}>Kiểm Tra Tính Hợp Lệ</div>

              <div
                className={`${styles.checklistItem} ${isNameValid ? styles.checkValid : styles.checkInvalid}`}
              >
                <span className={styles.checkIcon}>{isNameValid ? '✓' : '○'}</span>
                <span>Tên chính sách (tối thiểu 3 ký tự)</span>
              </div>

              <div
                className={`${styles.checklistItem} ${hasRules ? styles.checkValid : styles.checkInvalid}`}
              >
                <span className={styles.checkIcon}>{hasRules ? '✓' : '○'}</span>
                <span>Có ít nhất 1 mốc quy tắc hoàn tiền</span>
              </div>

              <div
                className={`${styles.checklistItem} ${isHoursValid ? styles.checkValid : styles.checkInvalid}`}
              >
                <span className={styles.checkIcon}>{isHoursValid ? '✓' : '○'}</span>
                <span>Số giờ trước khởi hành hợp lệ (≥ 0)</span>
              </div>

              <div
                className={`${styles.checklistItem} ${isPctValid ? styles.checkValid : styles.checkInvalid}`}
              >
                <span className={styles.checkIcon}>{isPctValid ? '✓' : '○'}</span>
                <span>Tỷ lệ hoàn tiền từ 0% đến 100%</span>
              </div>

              <div
                className={`${styles.checklistItem} ${isDescValid ? styles.checkValid : styles.checkInvalid}`}
              >
                <span className={styles.checkIcon}>{isDescValid ? '✓' : '○'}</span>
                <span>Tất cả các mốc đều có mô tả</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid || createMutation.isPending}
                style={{
                  padding: '12px 18px',
                  fontWeight: 700,
                  fontSize: 14,
                  opacity: !isFormValid ? 0.6 : 1,
                  cursor: !isFormValid ? 'not-allowed' : 'pointer',
                }}
              >
                {createMutation.isPending ? 'Đang lưu chính sách...' : 'Lưu chính sách hoàn tiền'}
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(ROUTES.OPS_REFUND_POLICIES)}
                disabled={createMutation.isPending}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
