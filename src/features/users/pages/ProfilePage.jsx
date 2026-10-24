import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import FormField from '@/components/FormField';
import Spinner from '@/components/Spinner';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [serverErrorMsg, setServerErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile, reset]);

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (isError || !profile) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.errorBanner}>
          Không thể tải thông tin hồ sơ người dùng. Vui lòng thử đăng nhập lại.
        </div>
      </div>
    );
  }

  const handleUpdate = (values) => {
    setServerErrorMsg('');
    updateProfileMutation.mutate(
      {
        fullName: values.fullName.trim(),
        phone: values.phone?.trim() || null,
      },
      {
        onSuccess: (res) => {
          // Reset form state with newly updated values so isDirty resets to false
          reset({
            fullName: res.data?.fullName || values.fullName.trim(),
            phone: res.data?.phone || values.phone?.trim() || '',
          });
        },
        onError: (error) => {
          setServerErrorMsg(error.message);
          applyServerErrors(error, setError);
        },
      },
    );
  };

  const handleResetForm = () => {
    reset({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
    });
    setServerErrorMsg('');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case USER_ROLE.ADMIN:
        return `${styles.roleBadge} ${styles.roleBadgeAdmin}`;
      case USER_ROLE.STAFF:
        return `${styles.roleBadge} ${styles.roleBadgeStaff}`;
      case USER_ROLE.TOUR_GUIDE:
        return `${styles.roleBadge} ${styles.roleBadgeTourGuide}`;
      default:
        return styles.roleBadge;
    }
  };

  const avatarInitial = (profile.fullName || profile.email || 'U')[0].toUpperCase();

  return (
    <div className={styles.profileContainer}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to={ROUTES.HOME}>Trang chủ</Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span>Hồ sơ cá nhân</span>
      </nav>

      {/* Header */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Thông tin tài khoản</h1>
        <p className={styles.pageSubtitle}>
          Quản lý thông tin hồ sơ, thông tin liên hệ và cài đặt bảo mật của bạn tại renTrek.
        </p>
      </header>

      <div className={styles.layoutGrid}>
        {/* Left Column: User Summary Card */}
        <aside className={styles.userCard}>
          <div className={styles.avatarWrapper}>
            <span>{avatarInitial}</span>
          </div>

          <h2 className={styles.userCardName}>{profile.fullName || 'Người dùng renTrek'}</h2>
          <div className={styles.userCardEmail}>{profile.email}</div>

          <div className={styles.badgeRow}>
            <span className={getRoleBadgeClass(profile.role)}>
              {USER_ROLE_LABEL[profile.role] || profile.role}
            </span>
            <span className={styles.statusBadge}>
              <span className={styles.statusDot} />
              {profile.status === 'Active' ? 'Đang hoạt động' : profile.status}
            </span>
          </div>

          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Mã định danh:</span>
              <span className={styles.metaValue}>#{profile.userId}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Ngày tham gia:</span>
              <span className={styles.metaValue}>{formatDate(profile.createdAt)}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Cập nhật lần cuối:</span>
              <span className={styles.metaValue}>
                {profile.updatedAt ? formatDateTime(profile.updatedAt) : 'Chưa cập nhật'}
              </span>
            </div>
          </div>

          <div className={styles.securityNoteBox}>
            <div className={styles.securityNoteTitle}>
              <span>🔒 Bảo mật tài khoản</span>
            </div>
            Phiên làm việc được mã hóa JWT 2 lớp kết hợp cơ chế Refresh Token Rotation tự động
            phát hiện và ngăn chặn đăng nhập trái phép.
          </div>
        </aside>

        {/* Right Column: Update Profile Form */}
        <main className={styles.formCard}>
          <h2 className={styles.formCardTitle}>Chỉnh sửa thông tin</h2>
          <p className={styles.formCardSubtitle}>
            Cập nhật họ tên và số điện thoại liên lạc để nhận thông báo đặt đồ trekking nhanh nhất.
          </p>

          <form className={styles.profileForm} onSubmit={handleSubmit(handleUpdate)} noValidate>
            {serverErrorMsg && <div className={styles.errorBanner}>{serverErrorMsg}</div>}

            <FormField label="Họ và tên" htmlFor="fullName" error={errors.fullName}>
              <input
                id="fullName"
                type="text"
                className="input"
                placeholder="Nhập họ và tên đầy đủ"
                {...register('fullName', {
                  required: 'Họ và tên không được để trống',
                  minLength: { value: 2, message: 'Họ và tên tối thiểu 2 ký tự' },
                  maxLength: { value: 100, message: 'Họ và tên không vượt quá 100 ký tự' },
                })}
              />
            </FormField>

            <FormField label="Số điện thoại" htmlFor="phone" error={errors.phone}>
              <input
                id="phone"
                type="tel"
                className="input"
                placeholder="Ví dụ: 0912345678"
                {...register('phone', {
                  pattern: {
                    value: /^(03|05|07|08|09)\d{8}$/,
                    message:
                      'Số điện thoại không đúng định dạng VN (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)',
                  },
                })}
              />
              <div className={styles.inputHelper}>
                Dùng để liên hệ khi giao nhận thiết bị leo núi hoặc thông báo lịch trình tour.
              </div>
            </FormField>

            <div className={styles.formRow}>
              <FormField label="Địa chỉ Email (Cố định)" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  className={`input ${styles.readOnlyInput}`}
                  value={profile.email}
                  disabled
                  readOnly
                />
                <div className={styles.inputHelper}>
                  Email tài khoản không thể chỉnh sửa để bảo vệ dữ liệu.
                </div>
              </FormField>

              <FormField label="Vai trò hệ thống" htmlFor="role">
                <input
                  id="role"
                  type="text"
                  className={`input ${styles.readOnlyInput}`}
                  value={USER_ROLE_LABEL[profile.role] || profile.role}
                  disabled
                  readOnly
                />
                <div className={styles.inputHelper}>
                  Phân quyền chức năng tự động theo cấp độ tài khoản.
                </div>
              </FormField>
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResetForm}
                disabled={!isDirty || updateProfileMutation.isPending}
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${styles.btnSubmit}`}
                disabled={!isDirty || updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
