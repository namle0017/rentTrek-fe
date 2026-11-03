import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import FormField from '@/components/FormField';
import Spinner from '@/components/Spinner';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { getAvatarColor } from '@/utils/avatarColor';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import AvatarUploadModal from '../components/AvatarUploadModal';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [serverErrorMsg, setServerErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'sessions'
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

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
      address: '',
      bio: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth || '',
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
        address: values.address?.trim() || null,
        bio: values.bio?.trim() || null,
        dateOfBirth: values.dateOfBirth || null,
      },
      {
        onSuccess: (res) => {
          reset({
            fullName: res.data?.fullName || values.fullName.trim(),
            phone: res.data?.phone || values.phone?.trim() || '',
            address: res.data?.address || values.address?.trim() || '',
            bio: res.data?.bio || values.bio?.trim() || '',
            dateOfBirth: res.data?.dateOfBirth || values.dateOfBirth || '',
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
      address: profile.address || '',
      bio: profile.bio || '',
      dateOfBirth: profile.dateOfBirth || '',
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
  const avatarColor = getAvatarColor(profile.email || profile.fullName);

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
          Quản lý thông tin hồ sơ, ảnh đại diện, bảo mật mật khẩu và theo dõi các phiên đăng nhập tại renTrek.
        </p>
      </header>

      <div className={styles.layoutGrid}>
        {/* Left Column: User Summary Card */}
        <aside className={styles.userCard}>
          <div className={styles.avatarContainer}>
            <div
              className={styles.avatarWrapper}
              style={
                !profile.avatarUrl
                  ? { backgroundColor: avatarColor.bg, color: avatarColor.text }
                  : {}
              }
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName || 'Avatar'}
                  className={styles.avatarImage}
                />
              ) : (
                <span>{avatarInitial}</span>
              )}
            </div>
            <button
              type="button"
              className={styles.avatarEditBtn}
              onClick={() => setIsAvatarModalOpen(true)}
              title="Đổi ảnh đại diện"
              aria-label="Đổi ảnh đại diện"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>
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
            {profile.userCode && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Mã thành viên:</span>
                <span className={styles.metaValue}><strong>{profile.userCode}</strong></span>
              </div>
            )}
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Mã định danh:</span>
              <span className={styles.metaValue}>#{profile.userId.slice(0, 8)}...</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Ngày tham gia:</span>
              <span className={styles.metaValue}>{formatDate(profile.createdAt)}</span>
            </div>
            {profile.updatedAt && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Cập nhật lần cuối:</span>
                <span className={styles.metaValue}>{formatDateTime(profile.updatedAt)}</span>
              </div>
            )}
          </div>

          {profile.bio && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8125rem', color: '#475569', fontStyle: 'italic', textAlign: 'left' }}>
              &ldquo;{profile.bio}&rdquo;
            </div>
          )}
        </aside>

        {/* Right Column: Dynamic Form / Card */}
        <main className={styles.formCard}>
          {/* Sub Navigation Tabs */}
          <nav className={styles.tabNav} aria-label="Cài đặt tài khoản">
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === 'profile' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Thông tin cá nhân
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === 'password' ? styles.tabButtonActive : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Đổi mật khẩu
            </button>
          </nav>

          {/* Tab 1: Profile Form */}
          {activeTab === 'profile' && (
            <div>
              <div className={styles.tabHeader}>
                <h2 className={styles.formCardTitle}>Chỉnh sửa thông tin</h2>
                <p className={styles.formCardSubtitle}>
                  Cập nhật họ tên, liên lạc và địa chỉ nhận thiết bị để renTrek phục vụ tốt nhất cho các chuyến đi.
                </p>
              </div>

              <form className={styles.profileForm} onSubmit={handleSubmit(handleUpdate)} noValidate>
                {serverErrorMsg && <div className={styles.errorBanner}>{serverErrorMsg}</div>}

                <div className={styles.formRow}>
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
                  </FormField>
                </div>

                <div className={styles.formRow}>
                  <FormField label="Ngày sinh" htmlFor="dateOfBirth" error={errors.dateOfBirth}>
                    <input
                      id="dateOfBirth"
                      type="date"
                      className="input"
                      {...register('dateOfBirth')}
                    />
                  </FormField>

                  <FormField label="Địa chỉ giao nhận mặc định" htmlFor="address" error={errors.address}>
                    <input
                      id="address"
                      type="text"
                      className="input"
                      placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
                      {...register('address', {
                        maxLength: { value: 500, message: 'Địa chỉ không vượt quá 500 ký tự' },
                      })}
                    />
                  </FormField>
                </div>

                <FormField label="Giới thiệu bản thân (Bio)" htmlFor="bio" error={errors.bio}>
                  <textarea
                    id="bio"
                    className="input"
                    rows="3"
                    placeholder="Chia sẻ đôi nét về sở thích dã ngoại, kinh nghiệm trekking hoặc leo núi của bạn..."
                    style={{ resize: 'vertical' }}
                    {...register('bio', {
                      maxLength: { value: 500, message: 'Giới thiệu không vượt quá 500 ký tự' },
                    })}
                  />
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
            </div>
          )}

          {/* Tab 2: Change Password */}
          {activeTab === 'password' && <ChangePasswordForm />}
        </main>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={profile.avatarUrl}
      />
    </div>
  );
}
