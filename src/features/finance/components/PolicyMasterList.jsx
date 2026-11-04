import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REFUND_POLICY_STATUS, REFUND_POLICY_TYPE, REFUND_POLICY_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import styles from './finance.module.css';

export default function PolicyMasterList({
  policies = [],
  selectedPolicyId,
  onSelectPolicy,
  isLoading = false,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPolicies = policies.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.policyId?.toLowerCase().includes(term) ||
      p.policyType?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (policy) => {
    const isLocked = Boolean(policy.isLocked || policy.activeTripsCount > 0);
    if (isLocked) {
      return (
        <span
          className={styles.badge}
          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
        >
          Đang áp dụng ({policy.activeTripsCount} chuyến)
        </span>
      );
    }
    if (policy.status === REFUND_POLICY_STATUS.ACTIVE) {
      return (
        <span
          className={styles.badge}
          style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}
        >
          Bản nháp / Mở sửa
        </span>
      );
    }
    return (
      <span
        className={styles.badge}
        style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}
      >
        Hết hiệu lực
      </span>
    );
  };

  return (
    <div className={styles.masterCardWrapper}>
      {/* Tìm kiếm & Nút Tạo mới */}
      <div className={styles.masterSearchBox}>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}
        >
          <span style={{ fontSize: "var(--font-size-meta)", fontWeight: "var(--font-weight-bold)", color: '#334155' }}>
            Danh Sách ({policies.length})
          </span>
          <button
            type="button"
            className="btn btn-primary"
            style={{ fontSize: "var(--font-size-control)", padding: '4px 10px' }}
            onClick={() => navigate(ROUTES.OPS_REFUND_POLICY_CREATE)}
            title="Tạo chính sách hoàn tiền mới"
          >
            + Tạo mới
          </button>
        </div>

        <input
          type="text"
          className={styles.masterSearchInput}
          placeholder="Tìm theo tên chính sách..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Danh sách các Policy Cards */}
      <div className={styles.masterList}>
        {isLoading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: "var(--font-size-meta)" }}>
            Đang tải danh sách...
          </div>
        ) : !filteredPolicies.length ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: "var(--font-size-meta)" }}>
            Không tìm thấy chính sách nào.
          </div>
        ) : (
          filteredPolicies.map((p) => {
            const isSelected = p.policyId === selectedPolicyId;
            const isTour = p.policyType === REFUND_POLICY_TYPE.TOUR;

            return (
              <div
                key={p.policyId}
                className={`${styles.policyMasterItem} ${isSelected ? styles.policyMasterItemActive : ''}`}
                onClick={() => onSelectPolicy(p.policyId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectPolicy(p.policyId);
                }}
              >
                <div className={styles.masterItemTitle}>
                  <span>{p.name}</span>
                  <span
                    className={styles.badge}
                    style={{
                      background: isTour ? '#e0f2fe' : '#fef3c7',
                      color: isTour ? '#0369a1' : '#b45309',
                      fontSize: "var(--font-size-status)",
                      padding: '2px 6px',
                    }}
                  >
                    {REFUND_POLICY_TYPE_LABEL[p.policyType] || p.policyType}
                  </span>
                </div>

                <div className={styles.masterItemMeta}>
                  <span>{getStatusBadge(p)}</span>
                  <span>Hiệu lực: {p.effectiveUntil ? formatDate(p.effectiveUntil) : 'Vĩnh viễn'}</span>
                </div>

                <div style={{ fontSize: "var(--font-size-meta)", color: '#94a3b8', marginTop: 4 }}>
                  {p.rules?.length || 0} mốc quy tắc hoàn tiền
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
