import { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { options } from '../constants/opsOptions';
import OperationDialog from './OperationDialog';
import styles from './Operations.module.css';

export default function UserAccountActions({ user, showDetails = true }) {
  const { currentUser } = useAuth();
  const [action, setAction] = useState(null);
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const canManage = isAdmin && user.userId !== currentUser.userId && user.role !== USER_ROLE.ADMIN;
  const isLocked = user.status === 'Locked';
  const reasonField = { name: 'reason', label: 'Lý do', type: 'textarea', required: true, maxLength: 500 };
  const configs = {
    role: {
      title: 'Đổi vai trò tài khoản',
      method: 'patch',
      submitLabel: 'Đổi vai trò',
      fields: [
        {
          name: 'role',
          label: 'Vai trò mới',
          type: 'select',
          required: true,
          options: options('Customer', 'Staff', 'Guide').filter((option) => option.value !== user.role),
        },
        reasonField,
      ],
      description:
        'Sau khi đổi vai trò, các phiên đăng nhập hiện tại sẽ bị thu hồi. Người dùng cần đăng nhập lại.',
    },
    lock: {
      title: 'Khóa tài khoản',
      method: 'post',
      submitLabel: 'Khóa tài khoản',
      fields: [reasonField],
      description:
        'Tài khoản sẽ không thể đăng nhập và các phiên đang hoạt động trên mọi thiết bị sẽ bị thu hồi.',
    },
    unlock: {
      title: 'Mở khóa tài khoản',
      method: 'post',
      submitLabel: 'Mở khóa tài khoản',
      fields: [],
      description: 'Tài khoản sẽ trở lại trạng thái hoạt động và có thể đăng nhập lại.',
    },
  };
  const config = configs[action];

  return (
    <>
      {showDetails && <Link to={ROUTES.ADMIN_USER(user.userId)}>Chi tiết</Link>}
      {canManage ? (
        <>
          <button type="button" className={styles.secondary} onClick={() => setAction('role')}>
            Đổi vai trò
          </button>
          <button
            type="button"
            className={isLocked ? styles.secondary : styles.danger}
            onClick={() => setAction(isLocked ? 'unlock' : 'lock')}
          >
            {isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
          </button>
        </>
      ) : (
        isAdmin && (
          <span className={styles.muted}>
            {user.userId === currentUser.userId ? 'Tài khoản của bạn' : 'Admin được bảo vệ'}
          </span>
        )
      )}
      {canManage && config && (
        <OperationDialog
          key={`${user.userId}-${action}`}
          title={config.title}
          method={config.method}
          submitLabel={config.submitLabel}
          fields={config.fields}
          endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.USERS, user.userId, action)}
          onClose={() => setAction(null)}
        >
          <p>
            <strong>{user.fullName}</strong> · {user.email}
          </p>
          <p className={styles.muted}>{config.description}</p>
        </OperationDialog>
      )}
    </>
  );
}
