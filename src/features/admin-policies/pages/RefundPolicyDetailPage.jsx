import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, CheckCircle2, Copy, Lock, Pencil, Trash2 } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmDialog from '@/components/ConfirmDialog';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { REFUND_POLICY_TYPE_LABEL, USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import PolicyStatusBadge from '../components/PolicyStatusBadge';
import PolicyVersionHistory from '../components/PolicyVersionHistory';
import RefundStepChart from '../components/RefundStepChart';
import {
  useActivateRefundPolicy,
  useArchiveRefundPolicy,
  useCloneRefundPolicy,
  useDeleteRefundPolicy,
  useRefundPolicy,
} from '../hooks/useRefundPolicies';
import { formatHours } from '../utils/formatHours';
import styles from '../AdminPolicies.module.css';

const DIALOGS = {
  activate: {
    title: 'Áp dụng chính sách',
    message:
      'Chính sách sẽ có hiệu lực theo ngày bắt đầu. Các phiên bản cũ cùng chính sách sẽ được đóng lại. Bạn có chắc chắn?',
    confirmLabel: 'Áp dụng',
    tone: 'primary',
  },
  archive: {
    title: 'Ngừng áp dụng chính sách',
    message:
      'Chính sách sẽ không còn được dùng cho chuyến đi hoặc đơn mới. Các chuyến/đơn đã gắn vẫn giữ nguyên điều khoản. Bạn có chắc chắn?',
    confirmLabel: 'Ngừng áp dụng',
    tone: 'danger',
  },
  delete: {
    title: 'Xoá chính sách',
    message: 'Chính sách và các mốc hoàn tiền sẽ bị xoá. Bạn có chắc chắn muốn xoá?',
    confirmLabel: 'Xoá',
    tone: 'danger',
  },
};

export default function RefundPolicyDetailPage() {
  const params = useParams();
  const policyId = params.policyId ?? params.id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const [dialog, setDialog] = useState(null);

  const { data: policy, isLoading, isError, error, refetch } = useRefundPolicy(policyId);
  const activateMutation = useActivateRefundPolicy();
  const archiveMutation = useArchiveRefundPolicy();
  const deleteMutation = useDeleteRefundPolicy();
  const cloneMutation = useCloneRefundPolicy();

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!policy) return <ErrorState message="Không tìm thấy chính sách" />;

  const rules = [...(policy.rules ?? [])].sort((a, b) => b.minHoursBefore - a.minHoursBefore);
  const closeDialog = () => setDialog(null);

  const handleConfirm = () => {
    const done = { onSuccess: closeDialog, onError: closeDialog };
    if (dialog === 'activate') activateMutation.mutate(policyId, done);
    if (dialog === 'archive') archiveMutation.mutate(policyId, done);
    if (dialog === 'delete') {
      deleteMutation.mutate(policyId, {
        onSuccess: () => navigate(ROUTES.ADMIN_REFUND_POLICIES, { replace: true }),
        onError: closeDialog,
      });
    }
  };

  const handleClone = () => {
    cloneMutation.mutate(policyId, {
      onSuccess: (res) => {
        if (res?.data) navigate(ROUTES.ADMIN_REFUND_POLICY_EDIT(res.data));
      },
    });
  };

  const isPending = activateMutation.isPending || archiveMutation.isPending || deleteMutation.isPending;
  const dialogConfig = dialog ? DIALOGS[dialog] : null;
  const tripsCount = policy.tripsCount ?? 0;
  const ordersCount = policy.ordersCount ?? 0;

  return (
    <section className={styles.page} aria-label="Chi tiết chính sách hoàn tiền">
      <Breadcrumb
        items={[
          { label: 'Chính sách hoàn tiền', to: ROUTES.ADMIN_REFUND_POLICIES },
          { label: `${policy.name} (v${policy.version})` },
        ]}
      />

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{policy.name}</h2>
            <PolicyStatusBadge status={policy.displayStatus} />
            <span className={styles.typeTag}>
              {REFUND_POLICY_TYPE_LABEL[policy.policyType] ?? policy.policyType}
            </span>
          </div>
          {policy.description && <p className={styles.subtitle}>{policy.description}</p>}
        </div>

        {isAdmin && (
          <div className={styles.actions}>
            {policy.canEdit && (
              <Link className="btn btn-outline" to={ROUTES.ADMIN_REFUND_POLICY_EDIT(policyId)}>
                <Pencil size={16} aria-hidden="true" /> Chỉnh sửa
              </Link>
            )}
            {policy.canClone && (
              <button type="button" className="btn btn-outline" onClick={handleClone} disabled={cloneMutation.isPending}>
                <Copy size={16} aria-hidden="true" />{' '}
                {cloneMutation.isPending ? 'Đang tạo...' : 'Tạo phiên bản mới'}
              </button>
            )}
            {policy.canActivate && (
              <button type="button" className="btn btn-primary" onClick={() => setDialog('activate')}>
                <CheckCircle2 size={16} aria-hidden="true" /> Kích hoạt
              </button>
            )}
            {policy.canArchive && (
              <button type="button" className="btn btn-outline" onClick={() => setDialog('archive')}>
                <Archive size={16} aria-hidden="true" /> Ngừng áp dụng
              </button>
            )}
            {policy.canDelete && (
              <button type="button" className="btn btn-outline" onClick={() => setDialog('delete')}>
                <Trash2 size={16} aria-hidden="true" /> Xoá
              </button>
            )}
          </div>
        )}
      </header>


      {policy.isLocked && (
        <div className={`${styles.banner} ${styles.bannerWarn}`} role="status">
          <Lock size={18} className={styles.bannerIcon} aria-hidden="true" />
          <span>
            Chính sách đang được dùng bởi {tripsCount} chuyến đi và {ordersCount} đơn hàng nên không thể sửa hoặc xoá.
            {policy.canClone && ' Hãy tạo phiên bản mới để thay đổi điều khoản.'}
          </span>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Biểu đồ hoàn tiền</h3>
            <RefundStepChart rules={rules} />
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Các mốc hoàn tiền ({rules.length})</h3>
            <div className={styles.tableScroll} tabIndex="0" aria-label="Bảng mốc hoàn tiền">
              <table className={styles.miniTable}>
                <thead>
                  <tr>
                    <th scope="col">Huỷ trước khởi hành tối thiểu</th>
                    <th scope="col">Tỷ lệ hoàn</th>
                    <th scope="col">Mô tả</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={styles.muted}>
                        Chưa có mốc hoàn tiền nào.
                      </td>
                    </tr>
                  ) : (
                    rules.map((rule) => (
                      <tr key={rule.ruleId ?? rule.minHoursBefore}>
                        <td>{formatHours(rule.minHoursBefore)}</td>
                        <td>
                          <span className={styles.pct}>{rule.refundPercentage}%</span>
                        </td>
                        <td className={styles.muted}>{rule.description || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Thông tin chung</h3>
            <dl className={styles.infoList}>
              <dt>Phiên bản</dt>
              <dd>v{policy.version}</dd>
              <dt>Hiệu lực</dt>
              <dd>
                {formatDate(policy.effectiveFrom)} →{' '}
                {policy.effectiveUntil ? formatDate(policy.effectiveUntil) : 'Không thời hạn'}
              </dd>
              <dt>Đang dùng</dt>
              <dd>
                {tripsCount} chuyến · {ordersCount} đơn
              </dd>
              <dt>Người tạo</dt>
              <dd>{policy.createdByName || '—'}</dd>
              <dt>Ngày tạo</dt>
              <dd>{formatDateTime(policy.createdAt)}</dd>
              {policy.updatedAt && (
                <>
                  <dt>Cập nhật</dt>
                  <dd>{formatDateTime(policy.updatedAt)}</dd>
                </>
              )}
            </dl>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Lịch sử phiên bản</h3>
            <PolicyVersionHistory versions={policy.versions} currentPolicyId={policy.policyId} />
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(dialogConfig)}
        title={dialogConfig?.title}
        message={dialogConfig?.message}
        confirmLabel={dialogConfig?.confirmLabel}
        tone={dialogConfig?.tone}
        isPending={isPending}
        onConfirm={handleConfirm}
        onClose={closeDialog}
      />
    </section>
  );
}
