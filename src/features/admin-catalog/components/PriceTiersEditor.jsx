import { useState } from 'react';
import styles from '../pages/AdminCatalogDetail.module.css';
import bundleStyles from '../pages/AdminBundle.module.css';

/** Sửa bảng bậc giá thuê theo ngày (combo, biến thể). `onSave(tiers)` gửi [{ minDays, maxDays|null, dailyPrice }]. */
export default function PriceTiersEditor({ initialTiers, onSave, isPending }) {
  const [tiers, setTiers] = useState(initialTiers);

  const updateTier = (index, key, value) =>
    setTiers((current) => current.map((tier, i) => (i === index ? { ...tier, [key]: value } : tier)));

  const addTier = () =>
    setTiers((current) => {
      const last = current.at(-1);
      const minDays = last ? Number(last.maxDays || last.minDays) + 1 : 1;
      return [...current, { minDays, maxDays: '', dailyPrice: '' }];
    });

  // BE kiểm tra: bắt đầu từ ngày 1, liên tục, chỉ bậc cuối được bỏ trống số ngày tối đa
  const handleSave = () =>
    onSave(
      tiers.map((tier) => ({
        minDays: Number(tier.minDays),
        maxDays: tier.maxDays === '' || tier.maxDays === null ? null : Number(tier.maxDays),
        dailyPrice: Number(tier.dailyPrice),
      })),
    );

  return (
    <>
      <p className={styles.hint}>Bậc đầu từ ngày 1, các bậc nối tiếp nhau; bỏ trống “Đến ngày” ở bậc cuối.</p>
      {tiers.length > 0 && (
        <table className={bundleStyles.table}>
          <thead>
            <tr>
              <th scope="col">Từ ngày</th>
              <th scope="col">Đến ngày</th>
              <th scope="col">Giá/ngày (VND)</th>
              <th scope="col" aria-label="Thao tác" />
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="number"
                    min="1"
                    aria-label="Từ ngày"
                    value={tier.minDays}
                    onChange={(event) => updateTier(index, 'minDays', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    aria-label="Đến ngày"
                    value={tier.maxDays ?? ''}
                    onChange={(event) => updateTier(index, 'maxDays', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    aria-label="Giá mỗi ngày"
                    value={tier.dailyPrice}
                    onChange={(event) => updateTier(index, 'dailyPrice', event.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setTiers((current) => current.filter((_, i) => i !== index))}
                  >
                    Bỏ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={bundleStyles.actions}>
        <button type="button" className="btn btn-outline" disabled={tiers.length >= 20} onClick={addTier}>
          + Thêm bậc giá
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isPending || tiers.length === 0}
          onClick={handleSave}
        >
          {isPending ? 'Đang lưu…' : 'Lưu bảng giá'}
        </button>
      </div>
    </>
  );
}
