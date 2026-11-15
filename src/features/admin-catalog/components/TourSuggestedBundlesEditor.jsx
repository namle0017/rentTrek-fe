import { useState } from 'react';
import { PRODUCT_STATUS } from '../constants/adminCatalogStatus';
import {
  useAdminBundles,
  useSetTourSuggestedBundles,
  useTourSuggestedBundles,
} from '../hooks/useAdminCatalog';

/** Admin chọn combo gợi ý cho tour; khách thấy ở trang booking đã thanh toán. Staff chỉ xem. */
export default function TourSuggestedBundlesEditor({ tourId, canEdit, styles }) {
  const { data, isLoading } = useTourSuggestedBundles(tourId);
  if (isLoading || !data) return null;
  return (
    <Editor key={JSON.stringify(data)} tourId={tourId} initial={data} canEdit={canEdit} styles={styles} />
  );
}

function Editor({ tourId, initial, canEdit, styles }) {
  const [rows, setRows] = useState(initial);
  const [pick, setPick] = useState('');
  const bundles = useAdminBundles({ status: PRODUCT_STATUS.ACTIVE, pageNumber: 1, pageSize: 100 });
  const save = useSetTourSuggestedBundles();
  const options = (bundles.data?.items || []).filter((b) => !rows.some((row) => row.bundleId === b.bundleId));

  const add = () => {
    const bundle = options.find((b) => b.bundleId === pick);
    if (!bundle) return;
    setRows([...rows, { bundleId: bundle.bundleId, name: bundle.name, status: bundle.status, note: '' }]);
    setPick('');
  };
  const move = (index, delta) => {
    const next = [...rows];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setRows(next);
  };

  return (
    <section className={styles.panel} aria-label="Combo gợi ý cho tour">
      <div className={styles.panelHeaderRow}>
        <h2 className={styles.panelTitle}>Combo gợi ý</h2>
        <span className={styles.countBadge}>{rows.length} combo</span>
      </div>
      {rows.length ? (
        <ul className={styles.itemChecklist}>
          {rows.map((row, index) => (
            <li key={row.bundleId} className={styles.checkItem}>
              <div className={styles.checkItemContent}>
                <span className={styles.checkItemName}>{row.name}</span>
                {row.status !== PRODUCT_STATUS.ACTIVE && (
                  <span className={styles.mutedNote}>({row.status})</span>
                )}
              </div>
              {canEdit ? (
                <>
                  <input
                    aria-label={`Ghi chú cho ${row.name}`}
                    maxLength={500}
                    placeholder="Ghi chú cho khách (tuỳ chọn)"
                    value={row.note || ''}
                    onChange={(event) =>
                      setRows(
                        rows.map((r) =>
                          r.bundleId === row.bundleId ? { ...r, note: event.target.value } : r,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Đưa ${row.name} lên`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Đưa ${row.name} xuống`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((r) => r.bundleId !== row.bundleId))}
                    aria-label={`Bỏ ${row.name}`}
                  >
                    Bỏ
                  </button>
                </>
              ) : (
                row.note && <span className={styles.mutedNote}>— {row.note}</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.hint}>Chưa gợi ý combo nào cho tour này.</p>
      )}
      {canEdit && (
        <>
          <div>
            <select
              aria-label="Chọn combo để gợi ý"
              value={pick}
              onChange={(event) => setPick(event.target.value)}
            >
              <option value="">— Chọn combo đang cho thuê —</option>
              {options.map((b) => (
                <option key={b.bundleId} value={b.bundleId}>
                  {b.name}
                </option>
              ))}
            </select>
            <button type="button" disabled={!pick} onClick={add}>
              Thêm
            </button>
          </div>
          <button
            type="button"
            disabled={save.isPending}
            onClick={() =>
              save.mutate({
                tourId,
                items: rows.map((row, sortOrder) => ({
                  bundleId: row.bundleId,
                  sortOrder,
                  note: row.note || null,
                })),
              })
            }
          >
            Lưu combo gợi ý
          </button>
        </>
      )}
    </section>
  );
}
