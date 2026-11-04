import { useFieldArray, useForm } from 'react-hook-form';
import { useWriteOperation } from '@/features/operations/hooks/useOperations';
import { API_ENDPOINTS } from '@/api/endpoints';
import { options } from '@/features/operations/constants/opsOptions';
import styles from './Operations.module.css';

const emptyTier = { qualificationMetric: 'OrderAmount', minThreshold: 0, discountType: 'Percentage', discountValue: 10, giftProductVariantId: '', giftQuantity: '' };
export default function PromotionTiersForm({ promotionId, tiers }) {
  const mutation = useWriteOperation();
  const { register, control, handleSubmit, setError, formState: { errors } } = useForm({ defaultValues: { tiers: tiers.length ? tiers : [emptyTier] } });
  const array = useFieldArray({ control, name: 'tiers' });
  const handleSave = (values) => mutation.mutate({ endpoint: API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.PROMOTIONS, promotionId, 'tiers'), method: 'put', body: { tiers: values.tiers.map((tier) => ({ qualificationMetric: tier.qualificationMetric, minThreshold: Number(tier.minThreshold), discountType: tier.discountType, discountValue: Number(tier.discountValue), giftProductVariantId: tier.discountType === 'GiftItem' ? tier.giftProductVariantId?.trim() || null : null, giftQuantity: tier.discountType === 'GiftItem' ? Number(tier.giftQuantity) || null : null })) } }, { onError: (error) => setError('root', { message: error.message + (error.errors ? ' · ' + Object.values(error.errors).flat().join('; ') : '') }) });
  return <form className={styles.form} onSubmit={handleSubmit(handleSave)}>{array.fields.map((tier, index) => <section key={tier.id} className={styles.card}><div className={styles.heading}><h3>Bậc {index + 1}</h3><button className={styles.danger} type="button" onClick={() => array.remove(index)} disabled={array.fields.length <= 1}>Bỏ bậc</button></div><div className={styles.formGrid}>
    <label className={styles.field}>Thước đo<select {...register(`tiers.${index}.qualificationMetric`)}>{options('OrderAmount', 'ParticipantCount', 'RentalDays').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <label className={styles.field}>Ngưỡng tối thiểu<input type="number" min="0" step="1" {...register(`tiers.${index}.minThreshold`, { required: true, min: 0 })} /></label>
    <label className={styles.field}>Loại ưu đãi<select {...register(`tiers.${index}.discountType`)}>{options('Percentage', 'FixedAmount', 'GiftItem').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    <label className={styles.field}>Giá trị giảm<input type="number" min="0" step="any" {...register(`tiers.${index}.discountValue`, { required: true, min: 0 })} /></label>
    <label className={styles.field}>Mã biến thể quà tặng<input placeholder="Mã biến thể trong danh mục thiết bị" {...register(`tiers.${index}.giftProductVariantId`)} /></label>
    <label className={styles.field}>Số lượng quà<input type="number" min="1" step="1" {...register(`tiers.${index}.giftQuantity`)} /></label>
  </div></section>)}<div><button className={styles.secondary} type="button" disabled={array.fields.length >= 50} onClick={() => array.append(emptyTier)}>＋ Thêm bậc ưu đãi</button></div>{errors.root && <p className={styles.error} role="alert">{errors.root.message}</p>}<button className={styles.primary} disabled={mutation.isPending}>{mutation.isPending ? 'Đang lưu…' : 'Lưu các bậc ưu đãi'}</button></form>;
}
