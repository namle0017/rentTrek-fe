import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Plus } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import {
  REFUND_POLICY_STATUS_LABEL,
  REFUND_POLICY_TYPE_LABEL,
  USER_ROLE,
} from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatDate';
import PolicyStatusBadge from '../components/PolicyStatusBadge';
import { useRefundPolicyList } from '../hooks/useRefundPolicies';
import styles from '../AdminPolicies.module.css';

const INITIAL_FILTERS = { search: '', policyType: '', status: '', latestOnly: true };

export default function RefundPoliciesPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const navigate = useNavigate();
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const params = { pageNumber, pageSize: DEFAULT_PAGE_SIZE, ...filters };
  const { data: paged, isLoading, isError, error, refetch, isFetching } = useRefundPolicyList(params);

  const updateDraft = (patch) => setDraftFilters((current) => ({ ...current, ...patch }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setPageNumber(DEFAULT_PAGE_NUMBER);
    setFilters({ ...draftFilters, search: draftFilters.search.trim() });
  };

  const handleReset = () => {
    setDraftFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setPageNumber(DEFAULT_PAGE_NUMBER);
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!paged?.items?.length) return <EmptyState message="Chưa có chính sách hoàn tiền phù hợp với bộ lọc" />;

    return (
      <>
        <p className={styles.resultMeta} role="status">
          {isFetching ? 'Đang cập nhật danh sách…' : `${paged.totalItems} chính sách`}
        </p>
        <div className={styles.tableCard} aria-busy={isFetching}>
          <div
            className={styles.tableScroll}
            tabIndex="0"
            aria-label="Bảng chính sách hoàn tiền, cuộn ngang trên màn hình nhỏ"
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Tên chính sách</th>
                  <th scope="col">Loại</th>
                  <th scope="col">Phiên bản</th>
                  <th scope="col">Số mốc</th>
                  <th scope="col">Hiệu lực</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Đang dùng</th>
                  <th scope="col">Người tạo</th>
                </tr>
              </thead>
              <tbody>
                {paged.items.map((policy) => {
                  const inUse = (policy.usageCount ?? 0) > 0;
                  return (
                    <tr
                      key={policy.policyId}
                      className={styles.clickableRow}
                      onClick={() => navigate(ROUTES.ADMIN_REFUND_POLICY_DETAIL(policy.policyId))}
                    >
                      <td>
                        <Link
                          to={ROUTES.ADMIN_REFUND_POLICY_DETAIL(policy.policyId)}
                          className={styles.nameLink}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {policy.name}
                        </Link>
                      </td>
                      <td>{REFUND_POLICY_TYPE_LABEL[policy.policyType] ?? policy.policyType}</td>
                      <td className={styles.numeric}>
                        v{policy.version}
                        {policy.versionsCount > 1 && (
                          <span className={styles.muted}> / {policy.versionsCount} bản</span>
                        )}
                      </td>
                      <td className={styles.numeric}>{policy.rulesCount ?? 0} mốc</td>
                      <td className={`${styles.muted} ${styles.nowrap}`}>
                        {formatDate(policy.effectiveFrom)} →{' '}
                        {policy.effectiveUntil ? formatDate(policy.effectiveUntil) : 'Không thời hạn'}
                      </td>
                      <td>
                        <PolicyStatusBadge status={policy.displayStatus} />
                      </td>
                      <td>
                        <span className={`${styles.usage} ${inUse ? styles.usageLocked : ''}`.trim()}>
                          {inUse && <Lock size={14} aria-label="Đã khoá do đang được sử dụng" />}
                          {policy.tripsCount ?? 0} chuyến · {policy.ordersCount ?? 0} đơn
                        </span>
                      </td>
                      <td className={styles.muted}>{policy.createdByName || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          pageNumber={paged.pageNumber}
          totalPages={paged.totalPages}
          hasPrevious={paged.hasPrevious}
          hasNext={paged.hasNext}
          onPageChange={setPageNumber}
        />
      </>
    );
  };

  return (
    <section className={styles.page} aria-label="Chính sách hoàn tiền">
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.title}>Chính sách hoàn tiền</h2>
          <p className={styles.subtitle}>
            Quy định tỷ lệ hoàn tiền theo thời điểm huỷ cho tour trekking và đơn thuê thiết bị.
          </p>
        </div>
        {isAdmin && (
          <div className={styles.actions}>
            <Link className="btn btn-primary" to={ROUTES.ADMIN_REFUND_POLICY_CREATE}>
              <Plus size={16} aria-hidden="true" /> Tạo chính sách
            </Link>
          </div>
        )}
      </header>

      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Tìm chính sách</span>
          <input
            type="search"
            value={draftFilters.search}
            placeholder="Tên chính sách"
            maxLength="200"
            onChange={(event) => updateDraft({ search: event.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span>Loại chính sách</span>
          <select value={draftFilters.policyType} onChange={(event) => updateDraft({ policyType: event.target.value })}>
            <option value="">Tất cả loại</option>
            {Object.entries(REFUND_POLICY_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Trạng thái</span>
          <select value={draftFilters.status} onChange={(event) => updateDraft({ status: event.target.value })}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(REFUND_POLICY_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.checkField}>
          <input
            type="checkbox"
            checked={draftFilters.latestOnly}
            onChange={(event) => updateDraft({ latestOnly: event.target.checked })}
          />
          Chỉ hiện phiên bản mới nhất
        </label>
        <div className={styles.actions}>
          <button type="submit" className={`btn btn-primary ${styles.filterButton}`}>
            Lọc danh sách
          </button>
          <button type="button" className={`btn btn-outline ${styles.filterButton}`} onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </form>

      {renderContent()}
    </section>
  );
}
