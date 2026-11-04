import {
  REFUND_POLICY_STATUS,
  REFUND_POLICY_STATUS_LABEL,
  REFUND_POLICY_TYPE,
  REFUND_POLICY_TYPE_LABEL,
} from '@/constants/enums';
import { formatDate } from '@/utils/formatDate';
import styles from './finance.module.css';

export default function PolicyTable({
  policies = [],
  selectedPolicyId,
  onSelectPolicy,
  onCloneVersion,
  isLoading = false,
  isCloning = false,
}) {
  if (isLoading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyBox}>Đang tải danh sách chính sách...</div>
      </div>
    );
  }

  if (!policies.length) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyBox}>
          <p>Chưa có chính sách hoàn tiền nào được tạo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên chính sách</th>
              <th>Loại</th>
              <th>Hiệu lực</th>
              <th>Trạng thái</th>
              <th>Đang áp dụng bởi</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => {
              const isSelected = policy.policyId === selectedPolicyId;
              const isLocked = policy.isLocked || policy.activeTripsCount > 0;

              return (
                <tr key={policy.policyId} style={isSelected ? { background: '#f0fdf4' } : {}}>
                  <td>
                    <div style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-meta)" }}>{policy.name}</div>
                    <div className={styles.statSubtext}>Tạo bởi: {policy.createdBy || 'Quản trị viên'}</div>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge}`}
                      style={{
                        background: policy.policyType === REFUND_POLICY_TYPE.TOUR ? '#dbeafe' : '#fef3c7',
                        color: policy.policyType === REFUND_POLICY_TYPE.TOUR ? '#1e40af' : '#92400e',
                      }}
                    >
                      {REFUND_POLICY_TYPE_LABEL[policy.policyType] || policy.policyType}
                    </span>
                  </td>
                  <td>
                    <div>Từ: {formatDate(policy.effectiveFrom)}</div>
                    {policy.effectiveUntil ? (
                      <div className={styles.statSubtext}>Đến: {formatDate(policy.effectiveUntil)}</div>
                    ) : (
                      <div className={styles.statSubtext} style={{ color: '#16a34a', fontWeight: "var(--font-weight-semibold)" }}>
                        Vĩnh viễn
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        policy.status === REFUND_POLICY_STATUS.ACTIVE
                          ? styles.badgeActive
                          : styles.badgeInactive
                      }`}
                    >
                      {REFUND_POLICY_STATUS_LABEL[policy.status] || policy.status}
                    </span>
                  </td>
                  <td>
                    {isLocked ? (
                      <div>
                        <span className={`${styles.badge} ${styles.badgeLocked}`}>
                          {policy.activeTripsCount} chuyến / đơn
                        </span>
                        <div className={styles.statSubtext} style={{ marginTop: 2 }}>
                          Đã khóa sửa trực tiếp
                        </div>
                      </div>
                    ) : (
                      <span className={styles.statSubtext}>Chưa áp dụng (Cho phép sửa)</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.actionBtnGroup} style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '5px 12px', fontSize: "var(--font-size-control)" }}
                        onClick={() => onSelectPolicy(policy.policyId)}
                      >
                        {isSelected ? 'Đang xem' : 'Xem quy tắc'}
                      </button>

                      {isLocked ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{
                            padding: '5px 10px',
                            fontSize: "var(--font-size-control)",
                            borderColor: '#818cf8',
                            color: '#4338ca',
                          }}
                          onClick={() => onCloneVersion(policy.policyId)}
                          disabled={isCloning}
                          title="Tạo bản sao mới để điều chỉnh quy định mà không ảnh hưởng đơn cũ"
                        >
                          Nhân bản
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
