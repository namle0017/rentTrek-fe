import { useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import styles from '../AdminPolicies.module.css';

const MAX_TIERS = 10;

/**
 * Editor bậc phạt cho một scope (PickupLate / ReturnLate).
 * name: tên field array trong form (vd. `pickupTiers`). Bậc "mất cọc" chọn bằng radio, luôn đúng một bậc.
 */
export default function RentalTierEditor({ name, title, hint, control, register, setValue, error }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  const watched = useWatch({ control, name }) ?? [];

  const selectTerminal = (index) => {
    fields.forEach((_, i) => setValue(`${name}.${i}.isTerminal`, i === index, { shouldDirty: true }));
  };

  const handleRemove = (index) => {
    const wasTerminal = Boolean(watched[index]?.isTerminal);
    remove(index);
    // Giữ đúng một bậc mất cọc: chuyển sang bậc cuối còn lại
    if (wasTerminal && fields.length > 1) {
      const lastIndex = fields.length - 2;
      setTimeout(() => setValue(`${name}.${lastIndex}.isTerminal`, true, { shouldDirty: true }), 0);
    }
  };

  return (
    <fieldset className={styles.tierBlock}>
      <legend className={styles.tierBlockHeader}>{title}</legend>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <ul className={styles.ruleList}>
        {fields.map((field, index) => (
          <li key={field.id} className={`${styles.ruleRow} ${styles.ruleRowTier}`}>
            <label className={styles.field}>
              <span>Trễ từ (ngày)</span>
              <input type="number" min="1" step="1" inputMode="numeric" {...register(`${name}.${index}.minDaysLate`)} />
            </label>
            <label className={styles.field}>
              <span>% tiền cọc bị trừ</span>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                inputMode="decimal"
                {...register(`${name}.${index}.percentOfDeposit`)}
              />
            </label>
            <label className={styles.radioCell}>
              <span>Mất cọc</span>
              <input
                type="radio"
                name={`${name}-terminal`}
                checked={Boolean(watched[index]?.isTerminal)}
                onChange={() => selectTerminal(index)}
                aria-label={`Bậc ${index + 1} là bậc mất cọc`}
              />
            </label>
            <button
              type="button"
              className={`btn btn-outline ${styles.ruleRemove}`}
              onClick={() => handleRemove(index)}
              disabled={fields.length <= 1}
              aria-label={`Xoá bậc ${index + 1}`}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
      <div>
        <button
          type="button"
          className="btn btn-outline"
          disabled={fields.length >= MAX_TIERS}
          onClick={() => append({ minDaysLate: '', percentOfDeposit: '', isTerminal: false })}
        >
          <Plus size={16} aria-hidden="true" /> Thêm bậc
        </button>
      </div>
    </fieldset>
  );
}
