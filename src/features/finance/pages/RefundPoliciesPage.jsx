import { useState } from 'react';
import { REFUND_POLICY_STATUS, REFUND_POLICY_TYPE, REFUND_POLICY_TYPE_LABEL } from '@/constants/enums';
import { formatDate } from '@/utils/formatDate';
import {
  useCloneRefundPolicyVersion,
  useRefundPolicies,
  useRefundPolicy,
  useUpdateRefundPolicyRules,
} from '../hooks/useRefundPolicies';
import PolicyMasterList from '../components/PolicyMasterList';
import PolicyCompactTimeline from '../components/PolicyCompactTimeline';
import PolicyRuleEditorModal from '../components/PolicyRuleEditorModal';
import styles from '../components/finance.module.css';

export default function RefundPoliciesPage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState('pol-001');
  const [isRuleEditorOpen, setIsRuleEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const { data: policies = [], isLoading: isListLoading } = useRefundPolicies();
  const { data: selectedPolicy } = useRefundPolicy(selectedPolicyId);

  const cloneMutation = useCloneRefundPolicyVersion();
  const updateRulesMutation = useUpdateRefundPolicyRules();

  const handleCloneVersion = (policyId) => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn nhân bản chính sách này sang phiên bản mới? Phiên bản cũ sẽ được đóng hiệu lực đến hôm nay, và bản mới sẽ được mở ở trạng thái cho phép chỉnh sửa quy tắc.',
      )
    ) {
      cloneMutation.mutate(policyId, {
        onSuccess: (res) => {
          if (res.data?.policyId) {
            setSelectedPolicyId(res.data.policyId);
          }
        },
      });
    }
  };

  const currentPolicy =
    selectedPolicy || policies.find((p) => p.policyId === selectedPolicyId) || policies[0];
  const isPolicyLocked = Boolean(currentPolicy?.isLocked || currentPolicy?.activeTripsCount > 0);

  const handleOpenAddRule = () => {
    setEditingRule(null);
    setIsRuleEditorOpen(true);
  };

  const handleOpenEditRule = (rule) => {
    setEditingRule(rule);
    setIsRuleEditorOpen(true);
  };

  const handleDeleteRule = (ruleId) => {
    if (!currentPolicy) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa mốc quy tắc này?')) {
      const remainingRules = (currentPolicy.rules || []).filter((r) => r.ruleId !== ruleId);
      updateRulesMutation.mutate({
        policyId: currentPolicy.policyId,
        rules: remainingRules,
      });
    }
  };

  const handleSaveRule = (ruleData) => {
    if (!currentPolicy) return;
    const newRules = [...(currentPolicy.rules || [])];
    const existingIndex = newRules.findIndex((r) => r.ruleId === ruleData.ruleId);

    if (existingIndex >= 0) {
      newRules[existingIndex] = ruleData;
    } else {
      newRules.push(ruleData);
    }

    // Tự động sắp xếp mốc giờ giảm dần
    newRules.sort((a, b) => b.minHoursBefore - a.minHoursBefore);

    updateRulesMutation.mutate(
      {
        policyId: currentPolicy.policyId,
        rules: newRules,
      },
      {
        onSuccess: () => {
          setIsRuleEditorOpen(false);
          setEditingRule(null);
        },
      },
    );
  };

  return (
    <div className={styles.container}>

      {/* Bố cục Master–Detail */}
      <div className={styles.masterDetailLayout}>
        {/* Cột Trái (Master List): Danh sách chính sách */}
        <div className={styles.masterColumn}>
          <PolicyMasterList
            policies={policies}
            selectedPolicyId={currentPolicy?.policyId}
            onSelectPolicy={setSelectedPolicyId}
            isLoading={isListLoading}
          />
        </div>

        {/* Cột Phải (Detail View): Chi tiết chính sách & Bảng quy tắc */}
        <div className={styles.detailColumn}>
          {currentPolicy ? (
            <>
              {/* Card thông tin tổng quan chính sách được chọn */}
              <div className={styles.tableCard} style={{ padding: '16px 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--color-text)' }}>
                        {currentPolicy.name}
                      </h2>
                      <span
                        className={styles.badge}
                        style={{
                          background:
                            currentPolicy.policyType === REFUND_POLICY_TYPE.TOUR ? '#e0f2fe' : '#fef3c7',
                          color: currentPolicy.policyType === REFUND_POLICY_TYPE.TOUR ? '#0369a1' : '#b45309',
                        }}
                      >
                        {REFUND_POLICY_TYPE_LABEL[currentPolicy.policyType] || currentPolicy.policyType}
                      </span>
                      {currentPolicy.status === REFUND_POLICY_STATUS.ACTIVE ? (
                        <span className={styles.badge} style={{ background: '#dcfce7', color: '#15803d' }}>
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className={styles.badge} style={{ background: '#fee2e2', color: '#b91c1c' }}>
                          Hết hiệu lực
                        </span>
                      )}
                    </div>

                    <div
                      style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 16, flexWrap: 'wrap' }}
                    >
                      <span>
                        Mã chính sách: <strong style={{ color: '#334155' }}>{currentPolicy.policyId}</strong>
                      </span>
                      <span>
                        Thời hạn hiệu lực:{' '}
                        <strong>
                          {formatDate(currentPolicy.effectiveFrom)} →{' '}
                          {currentPolicy.effectiveUntil
                            ? formatDate(currentPolicy.effectiveUntil)
                            : 'Vĩnh viễn'}
                        </strong>
                      </span>
                      <span>
                        Chuyến đi đang gán:{' '}
                        <strong style={{ color: isPolicyLocked ? '#b45309' : '#16a34a' }}>
                          {currentPolicy.activeTripsCount || 0} chuyến
                        </strong>
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '8px 0 0 0',
                        fontSize: 12,
                        color: isPolicyLocked ? '#b45309' : '#16a34a',
                      }}
                    >
                      {isPolicyLocked
                        ? `Đang áp dụng cho ${currentPolicy.activeTripsCount} chuyến đi thực tế. Chính sách ở chế độ chỉ đọc để đảm bảo tính pháp lý hợp đồng.`
                        : 'Chính sách đang ở trạng thái cho phép chỉnh sửa quy tắc trực tiếp.'}
                    </p>
                  </div>

                  {/* Nhóm nút thao tác */}
                  <div>
                    {isPolicyLocked ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{
                          borderColor: '#818cf8',
                          color: '#4338ca',
                          fontSize: 13,
                          padding: '7px 14px',
                        }}
                        onClick={() => handleCloneVersion(currentPolicy.policyId)}
                        disabled={cloneMutation.isPending}
                        title="Tạo phiên bản mới để chỉnh sửa mà không ảnh hưởng các chuyến đi đã chốt"
                      >
                        {cloneMutation.isPending ? 'Đang nhân bản...' : 'Nhân bản để sửa'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleOpenAddRule}
                        style={{
                          borderColor: '#16a34a',
                          color: '#16a34a',
                          fontSize: 13,
                          padding: '7px 14px',
                        }}
                      >
                        + Thêm mốc quy tắc
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tiến trình bậc thang nhỏ gọn (Compact Step Timeline) */}
              <PolicyCompactTimeline rules={currentPolicy.rules || []} policyName={currentPolicy.name} />

              {/* Bảng chi tiết các mốc quy tắc */}
              <div className={styles.tableCard}>
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                    Bảng Mốc Quy Tắc ({currentPolicy.rules?.length || 0})
                  </h3>
                  {!isPolicyLocked && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '4px 10px', borderColor: '#16a34a', color: '#16a34a' }}
                      onClick={handleOpenAddRule}
                    >
                      + Thêm mốc
                    </button>
                  )}
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Mốc thời gian tối thiểu</th>
                        <th className={styles.numberCell}>Tỷ lệ hoàn tiền (%)</th>
                        <th>Mô tả quy tắc hiển thị cho khách hàng</th>
                        {!isPolicyLocked && <th style={{ textAlign: 'center' }}>Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {!currentPolicy.rules?.length ? (
                        <tr>
                          <td
                            colSpan={isPolicyLocked ? 3 : 4}
                            style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}
                          >
                            Chưa có mốc quy tắc nào. Bấm &quot;+ Thêm mốc quy tắc&quot; để cấu hình.
                          </td>
                        </tr>
                      ) : (
                        [...currentPolicy.rules]
                          .sort((a, b) => b.minHoursBefore - a.minHoursBefore)
                          .map((rule) => {
                            const hours = Number(rule.minHoursBefore);
                            const days = hours >= 24 ? Math.round((hours / 24) * 10) / 10 : 0;
                            const pct = Number(rule.refundPercentage);

                            return (
                              <tr key={rule.ruleId}>
                                <td>
                                  <div style={{ fontWeight: 600 }}>
                                    {hours === 0 ? 'Dưới mốc trước (0h)' : `≥ ${hours} giờ`}
                                  </div>
                                  {days > 0 && (
                                    <div style={{ fontSize: 11, color: '#64748b' }}>
                                      Tương đương {days} ngày trước khởi hành
                                    </div>
                                  )}
                                </td>
                                <td className={styles.numberCell}>
                                  <span
                                    style={{
                                      fontWeight: 800,
                                      fontSize: 14,
                                      color:
                                        pct === 100
                                          ? '#16a34a'
                                          : pct >= 70
                                            ? '#0284c7'
                                            : pct >= 40
                                              ? '#d97706'
                                              : '#dc2626',
                                    }}
                                  >
                                    {pct}%
                                  </span>
                                </td>
                                <td>
                                  <span style={{ fontSize: 13, color: '#334155' }}>
                                    {rule.description || 'Không có mô tả'}
                                  </span>
                                </td>
                                {!isPolicyLocked && (
                                  <td style={{ textAlign: 'center' }}>
                                    <div
                                      className={styles.actionBtnGroup}
                                      style={{ justifyContent: 'center' }}
                                    >
                                      <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{ fontSize: 11, padding: '3px 8px' }}
                                        onClick={() => handleOpenEditRule(rule)}
                                        title="Chỉnh sửa mốc quy tắc"
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-outline"
                                        style={{
                                          fontSize: 11,
                                          padding: '3px 8px',
                                          color: '#dc2626',
                                          borderColor: '#fca5a5',
                                        }}
                                        onClick={() => handleDeleteRule(rule.ruleId)}
                                        disabled={updateRulesMutation.isPending}
                                        title="Xóa mốc quy tắc"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.tableCard}>
              <div className={styles.emptyBox}>Vui lòng chọn một chính sách bên trái để xem chi tiết.</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chỉnh sửa / thêm mới mốc quy tắc */}
      {isRuleEditorOpen && (
        <PolicyRuleEditorModal
          initialData={editingRule}
          isOpen={isRuleEditorOpen}
          onClose={() => {
            setIsRuleEditorOpen(false);
            setEditingRule(null);
          }}
          onSave={handleSaveRule}
          isSubmitting={updateRulesMutation.isPending}
        />
      )}
    </div>
  );
}
