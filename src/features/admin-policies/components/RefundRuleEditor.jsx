import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import styles from '../AdminPolicies.module.css';

const MAX_RULES = 20;
const EMPTY_RULE = { minHoursBefore: '', refundPercentage: '' };

/**
 * Editor danh sách mốc hoàn tiền (useFieldArray, tên field `rules`).
 * fieldErrors: kết quả validateRefundRules(...).fieldErrors, key dạng `rules.<i>.minHoursBefore`.
 */
export default function RefundRuleEditor({ control, register, fieldErrors = {}, rootError }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'rules' });

  return (
    <div>
      <ul className={styles.ruleList}>
        {fields.map((field, index) => {
          const hoursKey = `rules.${index}.minHoursBefore`;
          const pctKey = `rules.${index}.refundPercentage`;
          return (
            <li key={field.id} className={styles.ruleRow}>
              <label className={styles.field}>
                <span>Huỷ trước khởi hành tối thiểu (giờ)</span>
                <input
                  type="number"
                  min="0"
                  max="8760"
                  step="1"
                  inputMode="numeric"
                  aria-invalid={Boolean(fieldErrors[hoursKey])}
                  {...register(hoursKey)}
                />
                {fieldErrors[hoursKey] && <p className={styles.fieldError}>{fieldErrors[hoursKey]}</p>}
              </label>
              <label className={styles.field}>
                <span>% hoàn tiền</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  inputMode="decimal"
                  aria-invalid={Boolean(fieldErrors[pctKey])}
                  {...register(pctKey)}
                />
                {fieldErrors[pctKey] && <p className={styles.fieldError}>{fieldErrors[pctKey]}</p>}
              </label>
              <button
                type="button"
                className={`btn btn-outline ${styles.ruleRemove}`}
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
                aria-label={`Xoá mốc ${index + 1}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      {rootError && (
        <p className={styles.fieldError} role="alert">
          {rootError}
        </p>
      )}
      <p className={styles.fieldHint}>
        Ví dụ: 168 giờ → 100% nghĩa là huỷ trước khởi hành từ 7 ngày trở lên được hoàn 100%.
      </p>
      <div>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => append(EMPTY_RULE)}
          disabled={fields.length >= MAX_RULES}
        >
          <Plus size={16} aria-hidden="true" /> Thêm mốc
        </button>
      </div>
    </div>
  );
}
