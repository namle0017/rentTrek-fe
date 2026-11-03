import { useState } from 'react';
import { formatDateTime } from '@/utils/formatDate';
import {
  ASSET_STATUS_LABEL,
  ASSIGNMENT_STATUS,
  ASSIGNMENT_STATUS_LABEL,
  RETURN_CONDITION_LABEL,
  RETURN_CONDITION_OPTIONS,
} from '../constants/rentalOpsLabels';
import styles from '../pages/RentalOps.module.css';

/**
 * Thiết bị của đơn: giao toàn bộ thiết bị đang giữ, và nhận trả từng thiết bị đang ở khách kèm tình trạng.
 */
export default function RentalAssetsPanel({ assignments, allowedActions, isPending, onHandover, onReturn }) {
  const [returns, setReturns] = useState({});
  const selected = Object.entries(returns).filter(([, value]) => value.checked);

  const updateReturn = (assignmentId, changes) =>
    setReturns((current) => ({
      ...current,
      [assignmentId]: { checked: false, condition: 'Normal', note: '', ...current[assignmentId], ...changes },
    }));

  const handleReturn = () => {
    onReturn(
      selected.map(([assignmentId, value]) => ({
        assignmentId,
        condition: value.condition,
        note: value.note.trim() || null,
      })),
      () => setReturns({}),
    );
  };

  return (
    <section className={styles.panel} aria-labelledby="rental-assets-title">
      <div className={styles.panelHead}>
        <h2 id="rental-assets-title" className={styles.panelTitle}>
          Thiết bị
        </h2>
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!allowedActions.canHandover || isPending}
            onClick={onHandover}
          >
            Giao toàn bộ thiết bị đang giữ
          </button>
        </div>
      </div>
      {!allowedActions.canHandover && allowedActions.handoverBlockedReason && (
        <p className={styles.hint}>Giao đồ: {allowedActions.handoverBlockedReason}</p>
      )}

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {allowedActions.canReturn && (
                <th scope="col">
                  <span className="sr-only">Chọn nhận trả</span>
                </th>
              )}
              <th scope="col">Mã thiết bị</th>
              <th scope="col">Thiết bị</th>
              <th scope="col">Phân bổ</th>
              <th scope="col">Tình trạng kho</th>
              <th scope="col">Giao lúc</th>
              <th scope="col">Trả lúc / tình trạng trả</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => {
              const isIssued = assignment.status === ASSIGNMENT_STATUS.ISSUED;
              const draft = returns[assignment.assignmentId];
              return (
                <tr key={assignment.assignmentId}>
                  {allowedActions.canReturn && (
                    <td>
                      {isIssued && (
                        <input
                          type="checkbox"
                          aria-label={`Nhận trả ${assignment.assetCode}`}
                          checked={Boolean(draft?.checked)}
                          onChange={(event) => updateReturn(assignment.assignmentId, { checked: event.target.checked })}
                        />
                      )}
                    </td>
                  )}
                  <td className={styles.code}>{assignment.assetCode}</td>
                  <td>{assignment.displayName}</td>
                  <td>{ASSIGNMENT_STATUS_LABEL[assignment.status] ?? assignment.status}</td>
                  <td>{ASSET_STATUS_LABEL[assignment.assetStatus] ?? assignment.assetStatus}</td>
                  <td>{assignment.issuedAt ? formatDateTime(assignment.issuedAt) : '—'}</td>
                  <td>
                    {isIssued && draft?.checked ? (
                      <div className={styles.returnInputs}>
                        <select
                          aria-label={`Tình trạng trả ${assignment.assetCode}`}
                          value={draft.condition}
                          onChange={(event) => updateReturn(assignment.assignmentId, { condition: event.target.value })}
                        >
                          {RETURN_CONDITION_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          aria-label={`Ghi chú ${assignment.assetCode}`}
                          placeholder="Ghi chú (tuỳ chọn)"
                          maxLength="500"
                          value={draft.note}
                          onChange={(event) => updateReturn(assignment.assignmentId, { note: event.target.value })}
                        />
                      </div>
                    ) : (
                      <>
                        {assignment.returnedAt ? formatDateTime(assignment.returnedAt) : '—'}
                        {assignment.returnCondition && (
                          <span className={styles.muted}>
                            {' '}
                            · {RETURN_CONDITION_LABEL[assignment.returnCondition] ?? assignment.returnCondition}
                          </span>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {allowedActions.canReturn && (
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={selected.length === 0 || isPending}
            onClick={handleReturn}
          >
            Nhận trả {selected.length > 0 ? `${selected.length} thiết bị đã chọn` : 'thiết bị'}
          </button>
        </div>
      )}
    </section>
  );
}
