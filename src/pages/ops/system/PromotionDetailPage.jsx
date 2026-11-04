import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { promotionFields } from '@/features/operations/constants/promotionFields';
import { options } from '@/features/operations/constants/opsOptions';
import ResourcePage from '@/features/operations/components/ResourcePage';
import OperationForm from '@/features/operations/components/OperationForm';
import PromotionTiersForm from '@/features/operations/components/PromotionTiersForm';
import StatusBadge from '@/features/operations/components/StatusBadge';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import styles from '@/features/operations/components/Operations.module.css';

const usageColumns = [{ key: 'orderCode', label: 'Đơn hàng', render: (row) => <Link to={ROUTES.ADMIN_ORDER(row.orderCode)}>{row.orderCode}</Link> }, { key: 'discountAmount', label: 'Đã giảm', render: (row) => formatCurrency(row.discountAmount) }, { key: 'giftQuantity', label: 'Quà tặng' }, { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge value={row.status} /> }, { key: 'appliedAt', label: 'Áp dụng lúc', render: (row) => formatDateTime(row.appliedAt) }];
export default function PromotionDetailPage() {
  const { promotionId } = useParams(); const [tab, setTab] = useState('general'); const { currentUser } = useAuth();
  const root = API_ENDPOINTS.ADMIN.DETAIL(API_ENDPOINTS.ADMIN.PROMOTIONS, promotionId);
  const query = useOperations(root);
  if (query.isPending) return <Spinner />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={query.refetch} />;
  const { promotion, tiers } = query.data; const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  return <div className={styles.page}><Link className={styles.muted} to={ROUTES.ADMIN_PROMOTIONS}>← Danh sách khuyến mãi</Link><div className={styles.heading}><div><span className={styles.eyebrow}>{promotion.promotionCode ?? 'Ưu đãi tự động'}</span><h1>{promotion.name}</h1></div><StatusBadge value={promotion.status} /></div>
    <nav className={styles.tabs} role="tablist" aria-label="Chi tiết khuyến mãi">{[['general', 'Thông tin chương trình'], ['tiers', 'Bậc ưu đãi'], ['usage', 'Lịch sử sử dụng']].map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>)}</nav>
    {tab === 'general' && <div className={styles.grid}><section className={styles.card}><h2>Thông tin khuyến mãi</h2>{isAdmin ? <OperationForm fields={promotionFields} endpoint={root} method="put" key={JSON.stringify(promotion)} values={{ ...promotion, startAt: dayjs(promotion.startAt).format('YYYY-MM-DDTHH:mm'), endAt: dayjs(promotion.endAt).format('YYYY-MM-DDTHH:mm') }} /> : <p>{promotion.description} · {formatDateTime(promotion.startAt)} → {formatDateTime(promotion.endAt)}</p>}</section><section className={styles.card}><h2>Trạng thái & mức sử dụng</h2><p>{promotion.usedCount} / {promotion.maxUses ?? 'Không giới hạn'} lượt</p>{isAdmin && <OperationForm endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.PROMOTIONS, promotionId, 'status')} method="patch" fields={[{ name: 'status', label: 'Trạng thái', type: 'select', options: options('Active', 'Paused', 'Expired'), required: true }]} />}</section></div>}
    {tab === 'tiers' && <section className={styles.card}><h2>Cấu hình điều kiện nhận ưu đãi</h2>{isAdmin ? <PromotionTiersForm key={JSON.stringify(tiers)} promotionId={promotionId} tiers={tiers} /> : tiers.map((tier) => <p key={tier.promotionTierId}>{tier.qualificationMetric} ≥ {tier.minThreshold} · {tier.discountValue} <StatusBadge value={tier.discountType} /></p>)}</section>}
    {tab === 'usage' && <ResourcePage title="Lịch sử sử dụng khuyến mãi" endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.PROMOTIONS, promotionId, 'usage')} columns={usageColumns} rowKey={(row) => row.appliedPromotionId} />}
  </div>;
}
