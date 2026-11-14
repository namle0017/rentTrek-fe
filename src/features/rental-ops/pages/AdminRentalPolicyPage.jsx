import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import RentalPolicySummary from '@/features/rentals/components/RentalPolicySummary';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTime } from '@/utils/formatDate';
import styles from './RentalOps.module.css';

const NUMBER_FIELDS = [
  ['depositPercent', '% cọc trên tiền thuê'],
  ['freeCancelLimit', 'Số lần huỷ miễn phí'],
  ['freeCancelWindowDays', 'Trong số ngày'],
  ['overLimitCancelFeePercent', '% cọc khi huỷ vượt lượt'],
  ['returnGraceHours', 'Giờ ân hạn trả'],
  ['extensionMaxDaysLate', 'Gia hạn tối đa sau hạn trả (ngày)'],
  ['suspectedLossAfterDays', 'Coi như mất sau (ngày trễ)'],
  ['receiptAutoConfirmHours', 'Tự xác nhận nhận đồ sau (giờ)'],
  ['minPhotosPerAsset', 'Số ảnh tối thiểu mỗi thiết bị'],
];

/** Chính sách cọc thuê đồ có version: tạo version mới kích hoạt ngay, đơn đã đặt giữ version cũ. */
export default function AdminRentalPolicyPage() {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const policies = useQuery({
    queryKey: ['rental-policies'],
    queryFn: () => axiosClient.get(API_ENDPOINTS.ADMIN_RENTAL_POLICIES),
    select: (res) => res.data,
  });
  const active = useQuery({
    queryKey: ['rental-policies', 'active'],
    queryFn: () => axiosClient.get(API_ENDPOINTS.RENTAL_POLICY_ACTIVE),
    select: (res) => res.data,
  });
  const create = useMutation({
    mutationFn: (payload) => axiosClient.post(API_ENDPOINTS.ADMIN_RENTAL_POLICIES, payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã tạo chính sách mới.');
      queryClient.invalidateQueries({ queryKey: ['rental-policies'] });
    },
  });
  const { register, control, handleSubmit, reset } = useForm({ values: active.data ?? undefined });
  const tiers = useFieldArray({ control, name: 'tiers' });

  if (active.isLoading) return <Spinner />;
  if (active.isError) return <ErrorState message={active.error?.message} onRetry={active.refetch} />;

  return (
    <section className={styles.page} aria-label="Chính sách cọc thuê đồ">
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>
          Đang áp dụng: {active.data.name} · v{active.data.version}
        </h2>
        <RentalPolicySummary policy={active.data} />
      </div>

      {isAdmin && (
        <form
          className={styles.panel}
          onSubmit={handleSubmit((values) =>
            create.mutate({
              name: values.name,
              ...Object.fromEntries(NUMBER_FIELDS.map(([key]) => [key, Number(values[key])])),
              tiers: values.tiers.map((t) => ({
                scope: t.scope,
                minDaysLate: Number(t.minDaysLate),
                percentOfDeposit: Number(t.percentOfDeposit),
                isTerminal: Boolean(t.isTerminal),
              })),
            }),
          )}
        >
          <h2 className={styles.panelTitle}>Tạo version mới</h2>
          <label className={styles.field}>
            <span>Tên chính sách</span>
            <input {...register('name', { required: true })} maxLength={255} />
          </label>
          <div className={styles.summaryGrid}>
            {NUMBER_FIELDS.map(([key, label]) => (
              <label key={key} className={styles.field}>
                <span>{label}</span>
                <input type="number" step="any" min="0" {...register(key, { required: true })} />
              </label>
            ))}
          </div>
          <h3 className={styles.subTitle}>Bậc phạt trễ (% tiền cọc)</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Loại</th>
                <th scope="col">Từ ngày trễ</th>
                <th scope="col">% cọc</th>
                <th scope="col">Mất toàn bộ cọc</th>
                <th scope="col" aria-label="Xoá" />
              </tr>
            </thead>
            <tbody>
              {tiers.fields.map((field, index) => (
                <tr key={field.id}>
                  <td>
                    <select {...register(`tiers.${index}.scope`)}>
                      <option value="PickupLate">Trễ nhận</option>
                      <option value="ReturnLate">Trễ trả</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" min="1" {...register(`tiers.${index}.minDaysLate`)} />
                  </td>
                  <td>
                    <input type="number" min="0" max="100" step="any" {...register(`tiers.${index}.percentOfDeposit`)} />
                  </td>
                  <td>
                    <input type="checkbox" {...register(`tiers.${index}.isTerminal`)} />
                  </td>
                  <td>
                    <button type="button" onClick={() => tiers.remove(index)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => tiers.append({ scope: 'PickupLate', minDaysLate: 1, percentOfDeposit: 0, isTerminal: false })}
            >
              + Thêm bậc
            </button>
            <button type="button" onClick={() => reset(active.data)}>
              Khôi phục bản đang áp dụng
            </button>
            <button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Đang lưu...' : 'Lưu & kích hoạt version mới'}
            </button>
          </div>
          {create.isError && (
            <p role="alert" className={styles.alert}>
              {create.error?.message}
              {create.error?.errors &&
                Object.values(create.error.errors)
                  .flat()
                  .map((m) => <span key={m}> · {m}</span>)}
            </p>
          )}
          <p className={styles.hint}>
            Mỗi loại cần đúng một bậc &quot;mất toàn bộ cọc&quot; và là bậc cuối. Đơn đã đặt vẫn dùng version lúc đặt.
          </p>
        </form>
      )}

      {policies.data?.length > 0 && (
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Lịch sử version</h2>
          <ul className={styles.lineList}>
            {policies.data.map((p) => (
              <li key={p.rentalPolicyId}>
                v{p.version} · {p.name} · cọc {p.depositPercent}% · {p.status} · từ{' '}
                {p.effectiveFrom ? formatDateTime(p.effectiveFrom) : '—'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
