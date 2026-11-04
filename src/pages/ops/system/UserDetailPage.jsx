import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { useAuth } from '@/hooks/useAuth';
import { profileFields, options, OPS_ENUM } from '@/features/operations/constants/opsOptions';
import OperationDialog from '@/features/operations/components/OperationDialog';
import OperationForm from '@/features/operations/components/OperationForm';
import ResourcePage from '@/features/operations/components/ResourcePage';
import StatusBadge from '@/features/operations/components/StatusBadge';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { formatDateTime } from '@/utils/formatDate';
import styles from '@/features/operations/components/Operations.module.css';

const tabs = [['profile', 'Hồ sơ'], ['security', 'Vai trò & bảo mật'], ['sessions', 'Phiên đăng nhập'], ['activities', 'Lịch sử hoạt động']];
const sessionColumns = [{ key: 'sessionId', label: 'Phiên thiết bị', render: (row) => `Phiên ${row.sessionId.slice(0, 8)}` }, { key: 'createdAt', label: 'Bắt đầu', render: (row) => formatDateTime(row.createdAt) }, { key: 'expiresAt', label: 'Hết hạn', render: (row) => formatDateTime(row.expiresAt) }];
const auditColumns = [{ key: 'createdAt', label: 'Thời điểm', render: (row) => formatDateTime(row.createdAt) }, { key: 'action', label: 'Hành động', render: (row) => <StatusBadge value={row.action} /> }, { key: 'actorFullName', label: 'Người thực hiện' }, { key: 'details', label: 'Chi tiết', render: (row) => <details><summary>Xem thay đổi</summary><pre className={styles.json}>{JSON.stringify(row.details, null, 2)}</pre></details> }];

export default function UserDetailPage() {
  const { userId } = useParams(); const { currentUser } = useAuth();
  const root = API_ENDPOINTS.ADMIN.DETAIL(API_ENDPOINTS.ADMIN.USERS, userId);
  const query = useOperations(root); const [tab, setTab] = useState('profile'); const [dialog, setDialog] = useState(null);
  const sessions = useOperations(API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.USERS, userId, 'sessions'), undefined, tab === 'sessions');
  if (query.isPending) return <Spinner />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={query.refetch} />;
  const { user, ...profile } = query.data;
  const canManage = user.userId !== currentUser?.userId && user.role !== OPS_ENUM.ADMIN;
  return <div className={styles.page}>
    <Link className={styles.muted} to={ROUTES.ADMIN_USERS}>← Danh sách người dùng</Link>
    <div className={styles.heading}><div><span className={styles.eyebrow}>{user.userCode}</span><h1>{user.fullName}</h1><p>{user.email} · {user.phone ?? 'Chưa có số điện thoại'}</p></div><div className={styles.toolbar}><StatusBadge value={user.role} /><StatusBadge value={user.status} /></div></div>
    <div className={styles.stats}><article className={styles.stat}><small>Đơn đã đặt</small><strong>{profile.ordersCount}</strong></article><article className={styles.stat}><small>Chuyến điều phối</small><strong>{profile.managedTripsCount}</strong></article><article className={styles.stat}><small>Chuyến hướng dẫn</small><strong>{profile.guidedTripsCount}</strong></article></div>
    <nav className={styles.tabs} role="tablist" aria-label="Chi tiết người dùng">{tabs.map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}>{label}</button>)}</nav>
    {tab === 'profile' && <section className={styles.card}><h2>Thông tin cá nhân</h2><OperationForm key={JSON.stringify(query.data)} endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.USERS, userId, 'profile')} method="put" fields={profileFields} values={{ ...profile, ...user }} /></section>}
    {tab === 'security' && <div className={styles.grid}><section className={styles.card}><h2>Vai trò tài khoản</h2>{canManage ? <OperationForm endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.USERS, userId, 'role')} method="patch" fields={[{ name: 'role', label: 'Vai trò mới', type: 'select', options: options('Customer', 'Staff', 'Guide'), required: true }, { name: 'reason', label: 'Lý do điều chuyển', type: 'textarea', required: true, maxLength: 500 }]} values={{ role: user.role }} /> : <p>Tài khoản quản trị viên được bảo vệ khỏi thay đổi vai trò.</p>}</section><section className={styles.card}><h2>Trạng thái truy cập</h2><p>Khóa tài khoản sẽ thu hồi phiên trên mọi thiết bị.</p>{canManage && <button className={styles.danger} onClick={() => setDialog({ title: user.status === OPS_ENUM.LOCKED ? 'Mở khóa tài khoản' : 'Khóa tài khoản', action: user.status === OPS_ENUM.LOCKED ? 'unlock' : 'lock', fields: user.status === OPS_ENUM.LOCKED ? [] : [{ name: 'reason', label: 'Lý do khóa', type: 'textarea', required: true, maxLength: 500 }] })}>{user.status === OPS_ENUM.LOCKED ? 'Mở khóa' : 'Khóa tài khoản'}</button>}</section></div>}
    {tab === 'sessions' && <><div><button className={styles.danger} onClick={() => setDialog({ title: 'Thu hồi tất cả phiên đăng nhập', action: 'sessions', method: 'delete', fields: [] })}>Thu hồi tất cả</button></div>{sessions.isPending ? <Spinner /> : sessions.isError ? <ErrorState message={sessions.error.message} onRetry={sessions.refetch} /> : <DataTable columns={sessionColumns} rows={sessions.data} rowKey={(row) => row.sessionId} actions={(row) => <button className={styles.danger} onClick={() => setDialog({ title: 'Thu hồi phiên đăng nhập', action: `sessions/${row.sessionId}`, method: 'delete', fields: [] })}>Thu hồi</button>} />}</>}
    {tab === 'activities' && <ResourcePage title="Hoạt động tài khoản" endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.USERS, userId, 'activities')} columns={auditColumns} rowKey={(row) => row.auditLogId} />}
    {dialog && <OperationDialog {...dialog} endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.USERS, userId, dialog.action)} onClose={() => setDialog(null)} />}
  </div>;
}
