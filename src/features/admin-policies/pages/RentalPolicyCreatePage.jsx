import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Breadcrumb from '@/components/Breadcrumb';
import ConfirmDialog from '@/components/ConfirmDialog';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { applyServerErrors } from '@/utils/applyServerErrors';
import RentalTierEditor from '../components/RentalTierEditor';
import {
  useActiveRentalPolicy,
  useCreateRentalPolicyVersion,
  useRentalPolicy,
} from '../hooks/useRentalPolicies';
import { flattenTiers, toRentalFormValues, toRentalPayload } from '../utils/rentalPolicyForm';
import { validateRentalTiers } from '../utils/validateRentalTiers';
import styles from '../AdminPolicies.module.css';

const SERVER_FIELDS = [
  'name',
  'depositPercent',
  'overLimitCancelFeePercent',
  'freeCancelLimit',
  'returnGraceHours',
  'extensionMaxDaysLate',
  'suspectedLossAfterDays',
  'receiptAutoConfirmHours',
  'minPhotosPerAsset',
];

// [tên field, nhãn, min, max (null = không giới hạn), step, gợi ý]
const NUMBER_FIELDS = [
  ['depositPercent', '% tiền cọc', 0, 100, 'any'],
  ['freeCancelLimit', 'Số lần huỷ miễn phí', 0, null, 1],
  ['freeCancelWindowDays', 'Trong khoảng (ngày)', 1, null, 1],
  ['overLimitCancelFeePercent', '% phí huỷ khi vượt giới hạn', 0, 100, 'any'],
  ['returnGraceHours', 'Ân hạn trả đồ (giờ)', 0, null, 1],
  ['extensionMaxDaysLate', 'Gia hạn tối đa khi trễ (ngày)', 0, null, 1],
  ['suspectedLossAfterDays', 'Nghi mất đồ sau (ngày)', 1, null, 1],
  ['receiptAutoConfirmHours', 'Tự xác nhận nhận hàng sau (giờ)', 1, null, 1],
  ['minPhotosPerAsset', 'Ảnh tối thiểu mỗi thiết bị', 0, null, 1],
];

function RentalPolicyForm({ source, sourcePolicyId }) {
  const navigate = useNavigate();
  const mutation = useCreateRentalPolicyVersion();
  const [pendingValues, setPendingValues] = useState(null);
  const [tierErrors, setTierErrors] = useState({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({ defaultValues: toRentalFormValues(source) });

  const onValid = (values) => {
    const check = validateRentalTiers(flattenTiers(values));
    setTierErrors(check.errors);
    if (!check.isValid) return;
    setPendingValues(values);
  };

  const handleConfirm = () => {
    mutation.mutate(toRentalPayload(pendingValues, sourcePolicyId), {
      onSuccess: () => navigate(ROUTES.ADMIN_RENTAL_POLICIES),
      onError: (err) => {
        setPendingValues(null);
        const handled = {};
        const rest = [];
        Object.entries(err?.errors ?? {}).forEach(([field, messages]) => {
          if (SERVER_FIELDS.includes(field)) handled[field] = messages;
          else rest.push(...[].concat(messages));
        });
        applyServerErrors({ errors: handled }, setError);
        setError('root', { message: [err?.message, ...rest].filter(Boolean).join(' · ') });
      },
    });
  };

  return (
    <form className={styles.mainCol} noValidate onSubmit={handleSubmit(onValid)}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Cọc & huỷ đơn</h3>
        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.span2}`}>
            <span>Tên phiên bản *</span>
            <input
              maxLength={255}
              aria-invalid={Boolean(errors.name)}
              {...register('name', {
                validate: (value) => value.trim().length > 0 || 'Vui lòng nhập tên chính sách',
              })}
            />
            {errors.name && <p className={styles.fieldError}>{errors.name.message}</p>}
          </label>
          {NUMBER_FIELDS.map(([name, label, min, max, step]) => (
            <label key={name} className={styles.field}>
              <span>{label} *</span>
              <input
                type="number"
                min={min}
                max={max ?? undefined}
                step={step}
                aria-invalid={Boolean(errors[name])}
                {...register(name, {
                  required: 'Vui lòng nhập giá trị',
                  validate: (value) => {
                    const num = Number(value);
                    if (!Number.isFinite(num)) return 'Giá trị không hợp lệ';
                    if (num < min) return `Giá trị tối thiểu là ${min}`;
                    if (max !== null && num > max) return `Giá trị tối đa là ${max}`;
                    return true;
                  },
                })}
              />
              {errors[name] && <p className={styles.fieldError}>{errors[name].message}</p>}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Phạt trễ nhận / trễ trả</h3>
        <div className={styles.tierGrid}>
          <RentalTierEditor
            name="pickupTiers"
            title="Trễ nhận đồ"
            hint="Khách không đến nhận đồ đúng hẹn."
            control={control}
            register={register}
            setValue={setValue}
            error={tierErrors.PickupLate}
          />
          <RentalTierEditor
            name="returnTiers"
            title="Trễ trả đồ"
            hint="Khách trả đồ muộn so với hạn."
            control={control}
            register={register}
            setValue={setValue}
            error={tierErrors.ReturnLate}
          />
        </div>
      </div>

      {errors.root && (
        <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
          {errors.root.message}
        </div>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate(ROUTES.ADMIN_RENTAL_POLICIES)}
          disabled={mutation.isPending}
        >
          Huỷ
        </button>
        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          Tạo & áp dụng phiên bản mới
        </button>
      </div>

      <ConfirmDialog
        open={Boolean(pendingValues)}
        title="Áp dụng ngay cho đơn mới"
        message="Phiên bản mới có hiệu lực ngay lập tức cho các đơn thuê tạo sau thời điểm này. Phiên bản hiện tại chuyển sang trạng thái 'Đã thay thế'. Các đơn cũ giữ nguyên điều khoản."
        confirmLabel="Áp dụng ngay"
        tone="primary"
        isPending={mutation.isPending}
        onConfirm={handleConfirm}
        onClose={() => setPendingValues(null)}
      />
    </form>
  );
}

export default function RentalPolicyCreatePage() {
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get('from');
  const fromQuery = useRentalPolicy(fromId);
  const activeQuery = useActiveRentalPolicy(!fromId);
  const sourceQuery = fromId ? fromQuery : activeQuery;

  if (sourceQuery.isLoading) return <Spinner />;
  if (sourceQuery.isError && fromId) {
    return <ErrorState message={sourceQuery.error?.message} onRetry={sourceQuery.refetch} />;
  }

  const source = sourceQuery.data ?? null;

  return (
    <section className={styles.page} aria-label="Tạo phiên bản chính sách thuê đồ">
      <Breadcrumb
        items={[
          { label: 'Chính sách thuê đồ', to: ROUTES.ADMIN_RENTAL_POLICIES },
          { label: 'Tạo phiên bản mới' },
        ]}
      />
      <header className={styles.headerMain}>
        <h2 className={styles.title}>Tạo phiên bản chính sách thuê đồ</h2>
        <p className={styles.subtitle}>
          {source
            ? `Điền sẵn từ phiên bản ${source.version} (${source.name}). Chỉnh sửa những mục cần thay đổi.`
            : 'Nhập đầy đủ thông số cho phiên bản đầu tiên.'}
        </p>
      </header>
      <RentalPolicyForm
        key={source?.rentalPolicyId ?? 'blank'}
        source={source}
        sourcePolicyId={fromId ?? undefined}
      />
    </section>
  );
}
