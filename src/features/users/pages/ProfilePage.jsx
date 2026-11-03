import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormField from '@/components/FormField';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { USER_ROLE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import ActiveSessionsList from '../components/ActiveSessionsList';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [serverErrorMsg, setServerErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  const [copied, setCopied] = useState(false);

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
      <div className={styles.pageWrapper}>
        <div className="container">
          <div className={styles.errorAlert} role="alert">
            Không thể tải thông tin hồ sơ người dùng. Vui lòng thử đăng nhập lại.
          </div>
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

  const handleCopyCode = async () => {
    const code = profile.userId ? profile.userId.toUpperCase() : '';
    if (!code) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      toast.info('Đã sao chép mã định danh vào bộ nhớ tạm');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.info(`Mã định danh: ${code}`);
    }
  };

  const avatarInitial = (profile.fullName || profile.email || 'U')[0].toUpperCase();
  const userCodeDisplay = profile.userId
    ? `#${profile.userId.slice(0, 8).toUpperCase()}`
    : '#USER';

  return (
    <div className={styles.pageWrapper}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <span>Tài khoản của tôi</span>
          <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
          <span className={styles.breadcrumbCurrent}>
            {activeTab === 'profile' ? 'Hồ sơ cá nhân' : 'Bảo mật & phiên'}
          </span>
        </nav>

        <div className={styles.layoutGrid}>
          {/* Aside Sidebar: Điều hướng tài khoản */}
          <aside className={styles.accountSidebar} aria-label="Menu tài khoản">
            <div className={styles.sidebarHeading}>Tài khoản của tôi</div>
            <nav className={styles.sidebarNav}>
              <Link to={ROUTES.MY_ORDERS} className={styles.navItem}>
                <OutdoorIcon name="bag" size={16} />
                <span>Đơn của tôi</span>
              </Link>
              <button
                type="button"
                className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <OutdoorIcon name="user" size={16} />
                <span>Hồ sơ cá nhân</span>
              </button>
              <button
                type="button"
                className={`${styles.navItem} ${activeTab === 'security' ? styles.navItemActive : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <OutdoorIcon name="shield" size={16} />
                <span>Bảo mật &amp; phiên</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className={styles.mainContent}>
            {activeTab === 'profile' && (
              <div className={styles.tabPane}>
                {/* Header Tiêu đề */}
                <header className={styles.paneHeader}>
                  <h1 className={styles.paneTitle}>Hồ sơ cá nhân</h1>
                  <div className={styles.paneMeta}>
                    Tham gia từ {formatDate(profile.createdAt)}
                  </div>
                </header>

                {/* Card 1: Avatar & Định danh */}
                <section className={styles.card} aria-label="Ảnh đại diện và thông tin tóm tắt">
                  <div className={styles.avatarRow}>
                    <div className={styles.avatarCircle} aria-hidden="true">
                      <span>{avatarInitial}</span>
                    </div>
                    <div className={styles.identityDetails}>
                      <h2 className={styles.userName}>{profile.fullName || 'Người dùng RenTrekk'}</h2>
                      <div className={styles.metaRow}>
                        <span className={styles.codeBadge}>{userCodeDisplay}</span>
                        <button
                          type="button"
                          className={styles.copyBtn}
                          onClick={handleCopyCode}
                          title="Sao chép toàn bộ mã định danh"
                        >
                          {copied ? '✓ Đã chép' : 'Sao chép'}
                        </button>
                        <span className={styles.metaDivider}>·</span>
                        <span className={styles.roleText}>
                          {USER_ROLE_LABEL[profile.role] || profile.role}
                        </span>
                        <span className={styles.statusPill}>
                          <span className={styles.statusDot} aria-hidden="true" />
                          {profile.status === 'Active' ? 'Đang hoạt động' : profile.status}
                        </span>
                      </div>
                      <div className={styles.avatarSubtext}>
                        Chưa có ảnh đại diện tải lên · Hiển thị chữ cái đầu mặc định
                      </div>
                    </div>
                  </div>
                </section>

                {/* Card 2: Form thông tin cơ bản */}
                <form onSubmit={handleSubmit(handleUpdate)} noValidate className={styles.profileForm}>
                  <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Thông tin cơ bản</h2>

                    {serverErrorMsg && (
                      <div className={styles.errorAlert} role="alert">
                        {serverErrorMsg}
                      </div>
                    )}

                    <div className={styles.formGrid}>
                      {/* Họ và tên */}
                      <FormField label="Họ và tên" htmlFor="fullName" error={errors.fullName} required>
                        <input
                          id="fullName"
                          type="text"
                          className={`input ${styles.textInput}`}
                          placeholder="Nhập họ và tên đầy đủ"
                          aria-invalid={errors.fullName ? 'true' : 'false'}
                          {...register('fullName', {
                            required: 'Vui lòng nhập họ và tên.',
                            minLength: { value: 2, message: 'Họ và tên tối thiểu 2 ký tự.' },
                            maxLength: { value: 100, message: 'Họ và tên không vượt quá 100 ký tự.' },
                          })}
                        />
                      </FormField>

                      {/* Số điện thoại */}
                      <FormField label="Số điện thoại" htmlFor="phone" error={errors.phone}>
                        <input
                          id="phone"
                          type="tel"
                          className={`input ${styles.textInput}`}
                          placeholder="Chưa cập nhật · Ví dụ: 0912345678"
                          aria-invalid={errors.phone ? 'true' : 'false'}
                          {...register('phone', {
                            pattern: {
                              value: /^(03|05|07|08|09)\d{8}$/,
                              message:
                                'Số điện thoại không đúng định dạng VN (10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).',
                            },
                          })}
                        />
                      </FormField>

                      {/* Email (Chỉ đọc) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="static-email">
                          Email
                        </label>
                        <div id="static-email" className={styles.readOnlyField}>
                          <span className={styles.readOnlyValue}>{profile.email}</span>
                          <span className={styles.readOnlyBadge}>Chỉ đọc</span>
                        </div>
                      </div>

                      {/* Vai trò (Chỉ đọc) */}
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="static-role">
                          Vai trò
                        </label>
                        <div id="static-role" className={styles.readOnlyField}>
                          <span className={styles.readOnlyValue}>
                            {USER_ROLE_LABEL[profile.role] || profile.role}
                          </span>
                          <span className={styles.readOnlyBadge}>Chỉ đọc</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Thanh nút thao tác dưới đáy */}
                  <div className={styles.actionBar}>
                    {isDirty && (
                      <span className={styles.dirtyNotice}>
                        Bạn có thay đổi chưa lưu
                      </span>
                    )}
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={handleResetForm}
                      disabled={!isDirty || updateProfileMutation.isPending}
                    >
                      Hủy thay đổi
                    </button>
                    <button
                      type="submit"
                      className={styles.btnPrimary}
                      disabled={!isDirty || updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Spinner size="sm" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        'Lưu thay đổi'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className={styles.tabPane}>
                {/* Header Tiêu đề Security */}
                <header className={styles.paneHeader}>
                  <h1 className={styles.paneTitle}>Bảo mật &amp; phiên đăng nhập</h1>
                  <div className={styles.paneMeta}>
                    {profile.updatedAt
                      ? `Lần cập nhật gần nhất: ${formatDateTime(profile.updatedAt)}`
                      : `Ngày tạo tài khoản: ${formatDate(profile.createdAt)}`}
                  </div>
                </header>

                <div className={styles.securityStack}>
                  {/* Card: Đổi mật khẩu */}
                  <section className={styles.card} aria-label="Đổi mật khẩu">
                    <ChangePasswordForm />
                  </section>

                  {/* Card: Phiên đang hoạt động */}
                  <section className={styles.card} aria-label="Quản lý thiết bị và phiên làm việc">
                    <ActiveSessionsList />
                  </section>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
