import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { REFUND_POLICY_TYPE, REFUND_POLICY_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { applyServerErrors } from '@/utils/applyServerErrors';
import RefundRuleEditor from '../components/RefundRuleEditor';
import RefundRuleSummary from '../components/RefundRuleSummary';
import RefundStepChart from '../components/RefundStepChart';
import {
  useCreateRefundPolicy,
  useRefundPolicy,
  useUpdateRefundPolicy,
} from '../hooks/useRefundPolicies';
import { hasZeroHourRule, validateRefundRules } from '../utils/validateRefundRules';
import styles from '../AdminPolicies.module.css';

const FORM_FIELDS = [
  'name',
  'description',
  'policyType',
  'effectiveFrom',
  'effectiveUntil',
  'rescheduleMinHoursBefore',
  'rescheduleFee',
  'maxReschedules',
  'noShowGraceMinutes',
];

const DEFAULT_RULES = [
  { minHoursBefore: 168, refundPercentage: 100 },
  { minHoursBefore: 72, refundPercentage: 70 },
  { minHoursBefore: 24, refundPercentage: 50 },
  { minHoursBefore: 0, refundPercentage: 0 },
];

const toDateInput = (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '');

function buildDefaults(policy) {
  if (!policy) {
    return {
      name: '',
      policyType: REFUND_POLICY_TYPE.TOUR,
      description: '',
      effectiveFrom: dayjs().format('YYYY-MM-DD'),
      effectiveUntil: '',
      rules: DEFAULT_RULES,
      rescheduleMinHoursBefore: '',
      rescheduleFee: 0,
      maxReschedules: 0,
      noShowGraceMinutes: 30,
    };
  }
  return {
    name: policy.name ?? '',
    policyType: policy.policyType ?? REFUND_POLICY_TYPE.TOUR,
    description: policy.description ?? '',
    effectiveFrom: toDateInput(policy.effectiveFrom),
    effectiveUntil: toDateInput(policy.effectiveUntil),
    rescheduleMinHoursBefore: policy.rescheduleMinHoursBefore ?? '',
    rescheduleFee: policy.rescheduleFee ?? 0,
    maxReschedules: policy.maxReschedules ?? 0,
    noShowGraceMinutes: policy.noShowGraceMinutes ?? 30,
    rules: [...(policy.rules ?? [])]
      .sort((a, b) => b.minHoursBefore - a.minHoursBefore)
      .map((rule) => ({ minHoursBefore: rule.minHoursBefore, refundPercentage: rule.refundPercentage })),
  };
}

function PolicyForm({ policy, policyId }) {
  const navigate = useNavigate();
  const isEdit = Boolean(policyId);
  const createMutation = useCreateRefundPolicy();
  const updateMutation = useUpdateRefundPolicy();
  const [showRuleErrors, setShowRuleErrors] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: buildDefaults(policy) });

  const watchedRules = useWatch({ control, name: 'rules' });
  const watchedType = useWatch({ control, name: 'policyType' });
  const isTour = (isEdit ? policy?.policyType ?? watchedType : watchedType) === REFUND_POLICY_TYPE.TOUR;
  const rules = useMemo(() => watchedRules ?? [], [watchedRules]);
  const validation = useMemo(() => validateRefundRules(rules), [rules]);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleServerError = (err) => {
    const handled = {};
    const rest = [];
    Object.entries(err?.errors ?? {}).forEach(([field, messages]) => {
      if (FORM_FIELDS.includes(field)) handled[field] = messages;
      else rest.push(...[].concat(messages));
    });
    applyServerErrors({ errors: handled }, setError);
    const summary = [err?.message, ...rest].filter(Boolean).join(' · ');
    setError('root', { message: summary || 'Không lưu được chính sách' });
  };

  const submit = (values, saveAsDraft) => {
    setShowRuleErrors(true);
    const check = validateRefundRules(values.rules);
    if (!check.isValid) return;

    const payload = {
      name: values.name.trim(),
      // Select bị disabled khi sửa có thể khiến RHF trả về undefined → lấy từ policy gốc
      policyType: isEdit ? policy?.policyType ?? values.policyType : values.policyType,
      description: values.description?.trim() ?? '',
      effectiveFrom: values.effectiveFrom,
      effectiveUntil: values.effectiveUntil || null,
      rules: values.rules.map((rule) => ({
        minHoursBefore: Number(rule.minHoursBefore),
        refundPercentage: Number(rule.refundPercentage),
      })),
      // Điều khoản đổi lịch / NoShow chỉ có nghĩa với chính sách tour; BE bỏ qua với loại thuê
      rescheduleMinHoursBefore: values.rescheduleMinHoursBefore === '' ? null : Number(values.rescheduleMinHoursBefore),
      rescheduleFee: Number(values.rescheduleFee || 0),
      maxReschedules: Number(values.maxReschedules || 0),
      noShowGraceMinutes: Number(values.noShowGraceMinutes ?? 30),
      saveAsDraft,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: policyId, payload },
        {
          onSuccess: () => navigate(ROUTES.ADMIN_REFUND_POLICY_DETAIL(policyId)),
          onError: handleServerError,
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) =>
          navigate(res?.data ? ROUTES.ADMIN_REFUND_POLICY_DETAIL(res.data) : ROUTES.ADMIN_REFUND_POLICIES),
        onError: handleServerError,
      });
    }
  };

  const onSaveDraft = handleSubmit((values) => submit(values, true));
  const onSaveActive = handleSubmit((values) => submit(values, false));
  const onSaveEdit = handleSubmit((values) => submit(values, policy?.status === 'Draft'));

  const fieldErrors = showRuleErrors ? validation.fieldErrors : {};
  const rootError = showRuleErrors ? validation.rootError : null;

  return (
    <form
      className={styles.layout}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (isEdit) onSaveEdit();
        else onSaveDraft();
      }}
    >
      <div className={styles.mainCol}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Thông tin chính sách</h3>
          <div className={styles.formGrid}>
            <label className={`${styles.field} ${styles.span2}`}>
              <span>Tên chính sách *</span>
              <input
                maxLength={200}
                aria-invalid={Boolean(errors.name)}
                {...register('name', {
                  validate: (value) => value.trim().length > 0 || 'Vui lòng nhập tên chính sách',
                  maxLength: { value: 200, message: 'Tên tối đa 200 ký tự' },
                })}
              />
              {errors.name && <p className={styles.fieldError}>{errors.name.message}</p>}
            </label>

            <label className={styles.field}>
              <span>Loại chính sách *</span>
              <select disabled={isEdit} {...register('policyType')}>
                {Object.entries(REFUND_POLICY_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {isEdit && <span className={styles.fieldHint}>Không thể đổi loại sau khi tạo.</span>}
            </label>

            <span aria-hidden="true" />

            <label className={styles.field}>
              <span>Ngày bắt đầu *</span>
              <input
                type="date"
                aria-invalid={Boolean(errors.effectiveFrom)}
                {...register('effectiveFrom', { required: 'Vui lòng chọn ngày bắt đầu' })}
              />
              {errors.effectiveFrom && <p className={styles.fieldError}>{errors.effectiveFrom.message}</p>}
            </label>

            <label className={styles.field}>
              <span>Ngày kết thúc (tuỳ chọn)</span>
              <input
                type="date"
                aria-invalid={Boolean(errors.effectiveUntil)}
                {...register('effectiveUntil', {
                  validate: (value) =>
                    !value ||
                    !getValues('effectiveFrom') ||
                    value > getValues('effectiveFrom') ||
                    'Ngày kết thúc phải sau ngày bắt đầu',
                })}
              />
              {errors.effectiveUntil && <p className={styles.fieldError}>{errors.effectiveUntil.message}</p>}
            </label>

            <label className={`${styles.field} ${styles.span2}`}>
              <span>Mô tả</span>
              <textarea rows={3} maxLength={2000} {...register('description')} />
            </label>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Các mốc hoàn tiền</h3>
          <RefundRuleEditor control={control} register={register} fieldErrors={fieldErrors} rootError={rootError} />
          {!hasZeroHourRule(rules) && (
            <div className={`${styles.banner} ${styles.bannerInfo}`} role="note">
              <AlertTriangle size={18} className={styles.bannerIcon} aria-hidden="true" />
              <span>Cần thêm mốc 0 giờ (huỷ sát giờ khởi hành) mới lưu được chính sách.</span>
            </div>
          )}
        </div>

        {isTour && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Đổi lịch &amp; vắng mặt</h3>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Đổi lịch trước khởi hành (giờ)</span>
                <input
                  type="number"
                  min={0}
                  max={8760}
                  aria-invalid={Boolean(errors.rescheduleMinHoursBefore)}
                  {...register('rescheduleMinHoursBefore', {
                    validate: (value) =>
                      value === '' ||
                      (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 8760) ||
                      'Số giờ phải từ 0 đến 8760',
                  })}
                />
                <span className={styles.fieldHint}>Để trống nếu không cho đổi lịch.</span>
                {errors.rescheduleMinHoursBefore && (
                  <p className={styles.fieldError}>{errors.rescheduleMinHoursBefore.message}</p>
                )}
              </label>
              <label className={styles.field}>
                <span>Số lần đổi tối đa</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  aria-invalid={Boolean(errors.maxReschedules)}
                  {...register('maxReschedules', {
                    min: { value: 0, message: 'Từ 0 đến 10 lần' },
                    max: { value: 10, message: 'Từ 0 đến 10 lần' },
                  })}
                />
                {errors.maxReschedules && <p className={styles.fieldError}>{errors.maxReschedules.message}</p>}
              </label>
              <label className={styles.field}>
                <span>Phí đổi lịch (VNĐ)</span>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  aria-invalid={Boolean(errors.rescheduleFee)}
                  {...register('rescheduleFee', { min: { value: 0, message: 'Phí không được âm' } })}
                />
                {errors.rescheduleFee && <p className={styles.fieldError}>{errors.rescheduleFee.message}</p>}
              </label>
              <label className={styles.field}>
                <span>Chờ khách vắng mặt (phút)</span>
                <input
                  type="number"
                  min={0}
                  max={1440}
                  aria-invalid={Boolean(errors.noShowGraceMinutes)}
                  {...register('noShowGraceMinutes', {
                    required: 'Vui lòng nhập số phút',
                    min: { value: 0, message: 'Từ 0 đến 1440 phút' },
                    max: { value: 1440, message: 'Từ 0 đến 1440 phút' },
                  })}
                />
                <span className={styles.fieldHint}>Quá thời gian này chưa điểm danh thì tính là vắng mặt.</span>
                {errors.noShowGraceMinutes && (
                  <p className={styles.fieldError}>{errors.noShowGraceMinutes.message}</p>
                )}
              </label>
            </div>
          </div>
        )}

        {errors.root && (
          <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
            {errors.root.message}
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={isPending}
            onClick={() => navigate(isEdit ? ROUTES.ADMIN_REFUND_POLICY_DETAIL(policyId) : ROUTES.ADMIN_REFUND_POLICIES)}
          >
            Huỷ
          </button>
          {isEdit ? (
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-outline" disabled={isPending} onClick={onSaveDraft}>
                Lưu nháp
              </button>
              <button type="button" className="btn btn-primary" disabled={isPending} onClick={onSaveActive}>
                {isPending ? 'Đang lưu...' : 'Lưu & áp dụng'}
              </button>
            </>
          )}
        </div>
      </div>

      <aside className={styles.sideCol}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Xem trước biểu đồ</h3>
          <RefundStepChart rules={rules} />
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Tóm tắt chính sách</h3>
          <RefundRuleSummary rules={rules} />
        </div>
      </aside>
    </form>
  );
}

export default function RefundPolicyEditorPage() {
  const params = useParams();
  const policyId = params.policyId ?? params.id;
  const { data: policy, isLoading, isError, error, refetch } = useRefundPolicy(policyId);

  if (policyId && isLoading) return <Spinner />;
  if (policyId && isError) return <ErrorState message={error?.message} onRetry={refetch} />;
  if (policyId && policy && policy.canEdit === false) {
    return <Navigate to={ROUTES.ADMIN_REFUND_POLICY_DETAIL(policyId)} replace />;
  }

  return (
    <section className={styles.page} aria-label="Soạn thảo chính sách hoàn tiền">
      <Breadcrumb
        items={[
          { label: 'Chính sách hoàn tiền', to: ROUTES.ADMIN_REFUND_POLICIES },
          policyId && policy?.name ? { label: policy.name, to: ROUTES.ADMIN_REFUND_POLICY_DETAIL(policyId) } : null,
          { label: policyId ? 'Chỉnh sửa' : 'Tạo chính sách mới' },
        ]}
      />
      <header className={styles.headerMain}>
        <h2 className={styles.title}>{policyId ? 'Chỉnh sửa chính sách hoàn tiền' : 'Tạo chính sách hoàn tiền'}</h2>
      </header>
      <PolicyForm key={policyId ?? 'new'} policy={policyId ? policy : null} policyId={policyId} />
    </section>
  );
}
