import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import ResourcePage from '@/features/operations/components/ResourcePage';
import UserAccountActions from '@/features/operations/components/UserAccountActions';
import StatusBadge from '@/features/operations/components/StatusBadge';
import { options } from '@/features/operations/constants/opsOptions';
import { formatDateTime } from '@/utils/formatDate';
import { userFields, roleOptions } from '@/features/operations/constants/opsOptions';
const columns = [
  {
    key: 'fullName',
    label: 'Người dùng',
    sortable: true,
    render: (row) => (
      <>
        <Link to={ROUTES.ADMIN_USER(row.userId)}>{row.fullName}</Link>
        <small>{row.userCode}</small>
      </>
    ),
  },
  {
    key: 'email',
    label: 'Liên hệ',
    sortable: true,
    render: (row) => (
      <>
        {row.email}
        <small>{row.phone ?? 'Chưa có số điện thoại'}</small>
      </>
    ),
  },
  { key: 'role', label: 'Vai trò', render: (row) => <StatusBadge value={row.role} /> },
  { key: 'status', label: 'Trạng thái', sortable: true, render: (row) => <StatusBadge value={row.status} /> },
  {
    key: 'lastLoginAt',
    label: 'Đăng nhập gần nhất',
    render: (row) => formatDateTime(row.lastLoginAt) || 'Chưa đăng nhập',
  },
];
export default function UsersPage() {
  return (
    <ResourcePage
      title="Quản trị người dùng"
      subtitle="Danh tính, phân quyền và bảo mật tài khoản."
      endpoint={API_ENDPOINTS.ADMIN.USERS}
      columns={columns}
      rowKey={(row) => row.userId}
      fields={userFields}
      createEndpoint={API_ENDPOINTS.ADMIN.STAFF}
      createLabel="Tạo Staff / Guide"
      filters={[
        { name: 'role', label: 'Vai trò', options: roleOptions },
        { name: 'status', label: 'Trạng thái', options: options('Active', 'Locked') },
      ]}
      actions={(user) => <UserAccountActions user={user} />}
    />
  );
}
