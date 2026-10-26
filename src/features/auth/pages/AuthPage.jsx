import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormField from '@/components/FormField';
import SplitText from '@/components/SplitText';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { useLogin } from '../hooks/useLogin';
import { useRegister } from '../hooks/useRegister';
import styles from './AuthPage.module.css';

export default function AuthPage({ defaultMode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegister = defaultMode
    ? defaultMode === 'register'
    : location.pathname === ROUTES.REGISTER;

  const redirectTo = location.state?.from?.pathname || ROUTES.HOME;

  // Mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Local state for UI
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginServerError, setLoginServerError] = useState('');
  const [registerServerError, setRegisterServerError] = useState('');

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setError: setLoginError,
    formState: { errors: loginErrors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  // Register Form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    setError: setRegisterError,
    getValues: getRegisterValues,
    formState: { errors: registerErrors },
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = (values) => {
    setLoginServerError('');
    loginMutation.mutate(
      { email: values.email.trim(), password: values.password },
      {
        onSuccess: () => navigate(redirectTo, { replace: true }),
        onError: (error) => {
          if (error.statusCode === 401 || error.statusCode === 403) {
            setLoginServerError(error.message);
          }
          applyServerErrors(error, setLoginError);
        },
      },
    );
  };

  const handleRegister = (values) => {
    setRegisterServerError('');
    registerMutation.mutate(
      {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || null,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: () => navigate(ROUTES.HOME, { replace: true }),
        onError: (error) => {
          if (error.statusCode === 409) {
            setRegisterError('email', { type: 'server', message: error.message });
          } else {
            setRegisterServerError(error.message);
          }
          applyServerErrors(error, setRegisterError);
        },
      },
    );
  };

  const switchTo = (targetMode) => {
    setLoginServerError('');
    setRegisterServerError('');
    navigate(targetMode === 'register' ? ROUTES.REGISTER : ROUTES.LOGIN);
  };

  return (
    <div className={styles.splitPage}>
      {/* ==================== CỘT TRÁI (HERO BANNER - 1.5) ==================== */}
      <div className={styles.heroColumn}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <Link to={ROUTES.HOME} className={styles.brandLogo}>
            <span className={styles.brandIcon}>▲</span>
            <SplitText
              tag="span"
              text="renTrek"
              effect="none"
              trigger="none"
              splitType="chars"
              hoverEffect="lift"
            />
          </Link>

          <div className={styles.heroTextGroup}>
            <span className={styles.heroTag}>
              <SplitText
                tag="span"
                text="Outdoor Adventure & Gear Escrow"
                effect="none"
                trigger="none"
                splitType="chars"
                hoverEffect="lift"
              />
            </span>
            <SplitText
              tag="h2"
              text="Chinh phục những cung đường kỳ vĩ"
              className={styles.heroHeading}
              effect="none"
              trigger="none"
              splitType="chars"
              hoverEffect="lift"
            />
            <SplitText
              tag="p"
              text="Nền tảng thuê trang bị dã ngoại cao cấp và tour trekking trọn gói. Tự tin bước vào thiên nhiên với hệ thống bảo chứng an toàn."
              className={styles.heroDescription}
              effect="none"
              trigger="none"
              splitType="words"
              hoverEffect="lift"
            />

            <div className={styles.featurePills}>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span>
                <SplitText
                  tag="span"
                  text="100% Trang thiết bị kiểm định trước giờ xuất phát"
                  splitType="words"
                  effect="none"
                  trigger="none"
                  hoverEffect="lift"
                />
              </div>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span>
                <SplitText
                  tag="span"
                  text="Ký quỹ bảo chứng — Hoàn cọc tự động tức thì"
                  splitType="words"
                  effect="none"
                  trigger="none"
                  hoverEffect="lift"
                />
              </div>
              <div className={styles.featurePill}>
                <span className={styles.pillIcon}>✓</span>
                <SplitText
                  tag="span"
                  text="Đội ngũ hướng dẫn viên chuyên nghiệp"
                  splitType="words"
                  effect="none"
                  trigger="none"
                  hoverEffect="lift"
                />
              </div>
            </div>
          </div>

          <div className={styles.heroFooter}>
            <SplitText
              tag="span"
              text={`© ${new Date().getFullYear()} renTrek Inc. Bản quyền thuộc về PRN232 renTrek.`}
              splitType="words"
              effect="none"
              trigger="none"
              hoverEffect="lift"
            />
          </div>
        </div>
      </div>

      {/* ==================== CỘT PHẢI (FORM CONTAINER - 2.5) ==================== */}
      <div className={styles.formColumn}>
        <div className={styles.cardWrapper}>
          <div className={styles.mobileBrand}>
            <Link to={ROUTES.HOME} className={styles.brandLogoMobile}>
              <span className={styles.brandIcon}>▲</span>
              <SplitText
                tag="span"
                text="renTrek"
                effect="none"
                trigger="none"
                splitType="chars"
                hoverEffect="lift"
              />
            </Link>
          </div>

          {/* Sliding Tab Switcher */}
          <div className={styles.tabSwitcher}>
            <button
              type="button"
              className={`${styles.tabBtn} ${!isRegister ? styles.tabBtnActive : ''}`}
              onClick={() => switchTo('login')}
            >
              <SplitText
                tag="span"
                text="Đăng nhập"
                effect="none"
                trigger="none"
                splitType="chars"
                hoverEffect="lift"
              />
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${isRegister ? styles.tabBtnActive : ''}`}
              onClick={() => switchTo('register')}
            >
              <SplitText
                tag="span"
                text="Đăng ký"
                effect="none"
                trigger="none"
                splitType="chars"
                hoverEffect="lift"
              />
            </button>
            <div
              className={`${styles.tabGlider} ${isRegister ? styles.gliderRegister : styles.gliderLogin}`}
            />
          </div>

          {/* Form Header */}
          <header className={styles.formHeader}>
            <SplitText
              tag="h1"
              text={isRegister ? 'Tạo tài khoản renTrek' : 'Chào mừng trở lại!'}
              className={styles.formTitle}
              effect="none"
              trigger="none"
              splitType="chars"
              hoverEffect="lift"
            />
            <SplitText
              tag="p"
              text={
                isRegister
                  ? 'Đăng ký ngay hôm nay để nhận ưu đãi thuê thiết bị dã ngoại'
                  : 'Vui lòng nhập email và mật khẩu của bạn để tiếp tục'
              }
              className={styles.formSubtitle}
              effect="none"
              trigger="none"
              splitType="words"
              hoverEffect="lift"
            />
          </header>

          {/* Sliding Track Viewport */}
          <div className={styles.sliderViewport}>
            <div
              className={styles.sliderTrack}
              style={{ transform: isRegister ? 'translateX(-50%)' : 'translateX(0%)' }}
            >
              {/* ==================== SLIDE 1: LOGIN ==================== */}
              <div
                className={`${styles.slide} ${!isRegister ? styles.slideActive : styles.slideInactive}`}
              >
                <form
                  className={styles.authForm}
                  onSubmit={handleLoginSubmit(handleLogin)}
                  noValidate
                >
                  {loginServerError && (
                    <div className={styles.errorBanner}>{loginServerError}</div>
                  )}

                  <FormField
                    label={
                      <SplitText
                        tag="span"
                        text="Địa chỉ Email"
                        effect="none"
                        trigger="none"
                        splitType="chars"
                        hoverEffect="lift"
                      />
                    }
                    htmlFor="login-email"
                    error={loginErrors.email}
                  >
                    <input
                      id="login-email"
                      type="email"
                      className="input"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...registerLogin('email', {
                        required: 'Email không được để trống',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Định dạng email không hợp lệ',
                        },
                      })}
                    />
                  </FormField>

                  <FormField
                    label={
                      <SplitText
                        tag="span"
                        text="Mật khẩu"
                        effect="none"
                        trigger="none"
                        splitType="chars"
                        hoverEffect="lift"
                      />
                    }
                    htmlFor="login-password"
                    error={loginErrors.password}
                  >
                    <div className={styles.passwordInputWrapper}>
                      <input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        className="input"
                        placeholder="Nhập mật khẩu"
                        autoComplete="current-password"
                        {...registerLogin('password', {
                          required: 'Mật khẩu không được để trống',
                        })}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggleBtn}
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showLoginPassword ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                  </FormField>

                  <button
                    type="submit"
                    className={`btn btn-primary ${styles.submitBtn}`}
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      'Đang xác thực...'
                    ) : (
                      <SplitText
                        tag="span"
                        text="Đăng nhập ngay"
                        effect="none"
                        trigger="none"
                        splitType="chars"
                        hoverEffect="lift"
                      />
                    )}
                  </button>
                </form>

                <div className={styles.formFooter}>
                  <SplitText
                    tag="span"
                    text="Chưa có tài khoản renTrek?"
                    effect="none"
                    trigger="none"
                    splitType="words"
                    hoverEffect="lift"
                  />{' '}
                  <button
                    type="button"
                    className={styles.switchModeBtn}
                    onClick={() => switchTo('register')}
                  >
                    <SplitText
                      tag="span"
                      text="Đăng ký ngay"
                      effect="none"
                      trigger="none"
                      splitType="chars"
                      hoverEffect="lift"
                    />
                  </button>
                </div>
              </div>

              {/* ==================== SLIDE 2: REGISTER ==================== */}
              <div
                className={`${styles.slide} ${isRegister ? styles.slideActive : styles.slideInactive}`}
              >
                <form
                  className={styles.authForm}
                  onSubmit={handleRegisterSubmit(handleRegister)}
                  noValidate
                >
                  {registerServerError && (
                    <div className={styles.errorBanner}>{registerServerError}</div>
                  )}

                  <FormField
                    label={
                      <SplitText
                        tag="span"
                        text="Họ và tên"
                        effect="none"
                        trigger="none"
                        splitType="chars"
                        hoverEffect="lift"
                      />
                    }
                    htmlFor="register-fullname"
                    error={registerErrors.fullName}
                  >
                    <input
                      id="register-fullname"
                      type="text"
                      className="input"
                      placeholder="Ví dụ: Nguyễn Văn A"
                      autoComplete="name"
                      {...registerRegister('fullName', {
                        required: 'Họ và tên không được để trống',
                        minLength: { value: 2, message: 'Họ và tên tối thiểu 2 ký tự' },
                        maxLength: { value: 100, message: 'Họ và tên không vượt quá 100 ký tự' },
                      })}
                    />
                  </FormField>

                  <FormField
                    label={
                      <SplitText
                        tag="span"
                        text="Địa chỉ Email"
                        effect="none"
                        trigger="none"
                        splitType="chars"
                        hoverEffect="lift"
                      />
                    }
                    htmlFor="register-email"
                    error={registerErrors.email}
                  >
                    <input
                      id="register-email"
                      type="email"
                      className="input"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...registerRegister('email', {
                        required: 'Email không được để trống',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Định dạng email không hợp lệ',
                        },
                      })}
                    />
                  </FormField>

                  <FormField
                    label={
                      <SplitText
                        tag="span"
                        text="Số điện thoại"
                        effect="none"
                        trigger="none"
                        splitType="chars"
                        hoverEffect="lift"
                      />
                    }
                    htmlFor="register-phone"
                    error={registerErrors.phone}
                  >
                    <input
                      id="register-phone"
                      type="tel"
                      className="input"
                      placeholder="0912345678 (tùy chọn)"
                      autoComplete="tel"
                      {...registerRegister('phone', {
                        pattern: {
                          value: /^(03|05|07|08|09)\d{8}$/,
                          message:
                            'Số điện thoại phải đúng 10 số đầu số Việt Nam (03, 05, 07, 08, 09)',
                        },
                      })}
                    />
                  </FormField>

                  <div className={styles.formRow}>
                    <FormField
                      label={
                        <SplitText
                          tag="span"
                          text="Mật khẩu"
                          effect="none"
                          trigger="none"
                          splitType="chars"
                          hoverEffect="lift"
                        />
                      }
                      htmlFor="register-password"
                      error={registerErrors.password}
                    >
                      <div className={styles.passwordInputWrapper}>
                        <input
                          id="register-password"
                          type={showRegisterPassword ? 'text' : 'password'}
                          className="input"
                          placeholder="Tối thiểu 8 ký tự"
                          autoComplete="new-password"
                          {...registerRegister('password', {
                            required: 'Mật khẩu không được để trống',
                            minLength: { value: 8, message: 'Mật khẩu phải từ 8 ký tự trở lên' },
                            validate: {
                              hasUpper: (v) =>
                                /[A-Z]/.test(v) || 'Cần ít nhất 1 chữ in hoa (A-Z)',
                              hasLower: (v) =>
                                /[a-z]/.test(v) || 'Cần ít nhất 1 chữ in thường (a-z)',
                              hasDigit: (v) => /[0-9]/.test(v) || 'Cần ít nhất 1 chữ số (0-9)',
                              hasSpecial: (v) =>
                                /[\W_]/.test(v) || 'Cần ít nhất 1 ký tự đặc biệt (!@#$...)',
                            },
                          })}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggleBtn}
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                          aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showRegisterPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                    </FormField>

                    <FormField
                      label={
                        <SplitText
                          tag="span"
                          text="Xác nhận mật khẩu"
                          effect="none"
                          trigger="none"
                          splitType="chars"
                          hoverEffect="lift"
                        />
                      }
                      htmlFor="register-confirmpassword"
                      error={registerErrors.confirmPassword}
                    >
                      <div className={styles.passwordInputWrapper}>
                        <input
                          id="register-confirmpassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="input"
                          placeholder="Nhập lại mật khẩu"
                          autoComplete="new-password"
                          {...registerRegister('confirmPassword', {
                            required: 'Vui lòng xác nhận lại mật khẩu',
                            validate: (value) =>
                              value === getRegisterValues('password') ||
                              'Mật khẩu xác nhận không khớp',
                          })}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggleBtn}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                        </button>
                      </div>
                    </FormField>
                  </div>

                  <SplitText
                    tag="p"
                    className={styles.termsText}
                    text="Bằng việc tạo tài khoản, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo chứng của renTrek."
                    effect="none"
                    trigger="none"
                    splitType="words"
                    hoverEffect="lift"
                  />

                  <button
                    type="submit"
                    className={`btn btn-primary ${styles.submitBtn}`}
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      'Đang tạo tài khoản...'
                    ) : (
                      <SplitText
                        tag="span"
                        text="Hoàn tất đăng ký"
                        effect="none"
                        trigger="none"
                        splitType="chars"
                        hoverEffect="lift"
                      />
                    )}
                  </button>
                </form>

                <div className={styles.formFooter}>
                  <SplitText
                    tag="span"
                    text="Đã có tài khoản renTrek?"
                    effect="none"
                    trigger="none"
                    splitType="words"
                    hoverEffect="lift"
                  />{' '}
                  <button
                    type="button"
                    className={styles.switchModeBtn}
                    onClick={() => switchTo('login')}
                  >
                    <SplitText
                      tag="span"
                      text="Đăng nhập ngay"
                      effect="none"
                      trigger="none"
                      splitType="chars"
                      hoverEffect="lift"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
