import { useState } from 'react';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import {
  ASSIGNMENT_STATUS,
  CHARGE_STATUS,
  CHARGE_STATUS_LABEL,
  CHARGE_TYPE_LABEL,
  CHARGE_TYPE_OPTIONS,
  CHARGE_TYPES_REQUIRE_ASSET,
} from '../constants/rentalOpsLabels';
import styles from '../pages/RentalOps.module.css';

const EMPTY_FORM = { chargeType: 'Damage', amount: '', reason: '', assignmentId: '' };

/**
 * Phí phát sinh: xác nhận / hủy phí đề xuất, lập phí hỏng / mất / khác cho thiết bị đã giao.
 */
export default function RentalChargesPanel({ charges, assignments, canAddCharge, isPending, onCreate, onAssess, onVoid }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [voiding, setVoiding] = useState({ chargeId: null, reason: '' });

  // Chỉ thiết bị đã từng giao cho đơn mới chịu phí (UAT-21)
  const deliveredAssignments = assignments.filter((a) => a.status !== ASSIGNMENT_STATUS.RESERVED);
  const requiresAsset = CHARGE_TYPES_REQUIRE_ASSET.includes(form.chargeType);

  const handleCreate = (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!(amount > 0)) return setFormError('Số tiền phí phải lớn hơn 0.');
    if (!form.reason.trim()) return setFormError('Vui lòng nhập lý do.');
    if (requiresAsset && !form.assignmentId) return setFormError('Phí hỏng / mất phải chọn thiết bị chịu phí.');

    setFormError('');
    onCreate(
      {
        chargeType: form.chargeType,
        amount,
        reason: form.reason.trim(),
        assignmentId: form.assignmentId || null,
      },
      () => setForm(EMPTY_FORM),
    );
  };

  const confirmVoid = () => {
    if (!voiding.reason.trim()) return;
    onVoid(voiding.chargeId, voiding.reason.trim(), () => setVoiding({ chargeId: null, reason: '' }));
  };

  return (
    <section className={styles.panel} aria-labelledby="rental-charges-title">
      <h2 id="rental-charges-title" className={styles.panelTitle}>
        Phí phát sinh
      </h2>

      {charges.length === 0 ? (
        <p className={styles.hint}>Chưa có khoản phí.</p>
      ) : (
        <ul className={styles.chargeList}>
          {charges.map((charge) => {
            const canChange = canAddCharge && [CHARGE_STATUS.DRAFT, CHARGE_STATUS.ASSESSED].includes(charge.status);
            return (
              <li key={charge.chargeId} className={charge.status === CHARGE_STATUS.DRAFT ? styles.chargeDraft : styles.charge}>
                <div className={styles.chargeHead}>
                  <strong>{CHARGE_TYPE_LABEL[charge.chargeType] ?? charge.chargeType}</strong>
                  <span className={charge.status === CHARGE_STATUS.VOIDED ? styles.voided : styles.amount}>
                    {formatCurrency(charge.amount)}
                  </span>
                </div>
                <p className={styles.muted}>
                  {CHARGE_STATUS_LABEL[charge.status] ?? charge.status}
                  {charge.assetCode && ` · ${charge.assetCode}`} · {formatDateTime(charge.createdAt)}
                </p>
                <p className={styles.reason}>{charge.reason}</p>

                {canChange && voiding.chargeId !== charge.chargeId && (
                  <div className={styles.actions}>
                    {charge.status === CHARGE_STATUS.DRAFT && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={isPending}
                        onClick={() => onAssess(charge.chargeId)}
                      >
                        Xác nhận phí
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={isPending}
                      onClick={() => setVoiding({ chargeId: charge.chargeId, reason: '' })}
                    >
                      Hủy phí
                    </button>
                  </div>
                )}

                {voiding.chargeId === charge.chargeId && (
                  <div className={styles.inlineForm}>
                    <input
                      aria-label="Lý do hủy phí"
                      placeholder="Lý do hủy phí"
                      maxLength="500"
                      value={voiding.reason}
                      onChange={(event) => setVoiding((current) => ({ ...current, reason: event.target.value }))}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!voiding.reason.trim() || isPending}
                      onClick={confirmVoid}
                    >
                      Xác nhận hủy
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setVoiding({ chargeId: null, reason: '' })}>
                      Thôi
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canAddCharge && (
        <form className={styles.chargeForm} onSubmit={handleCreate} noValidate>
          <h3 className={styles.subTitle}>Lập phí mới</h3>
          <label className={styles.field}>
            <span>Loại phí</span>
            <select value={form.chargeType} onChange={(event) => setForm({ ...form, chargeType: event.target.value })}>
              {CHARGE_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Thiết bị chịu phí{requiresAsset ? ' *' : ''}</span>
            <select value={form.assignmentId} onChange={(event) => setForm({ ...form, assignmentId: event.target.value })}>
              <option value="">{requiresAsset ? 'Chọn thiết bị…' : 'Không gắn thiết bị (phí toàn đơn)'}</option>
              {deliveredAssignments.map((assignment) => (
                <option key={assignment.assignmentId} value={assignment.assignmentId}>
                  {assignment.assetCode} — {assignment.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>Số tiền (₫)</span>
            <input
              type="number"
              min="1"
              step="1000"
              inputMode="numeric"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span>Lý do</span>
            <input
              maxLength="500"
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
            />
          </label>
          {formError && (
            <p className="text-error" role="alert">
              {formError}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={isPending}>
            Lập phí
          </button>
        </form>
      )}
    </section>
  );
}
