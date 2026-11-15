import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/api/endpoints';
import OperationDialog from '@/features/operations/components/OperationDialog';
import styles from './ProductVariantTools.module.css';
import { validatePriceTiers } from '../utils/validatePriceTiers';

const api = API_ENDPOINTS.PRODUCT_MANAGEMENT;
const variantFields = [
  { name: 'sku', label: 'SKU', required: true, maxLength: 100 },
  { name: 'variantName', label: 'Tên biến thể', required: true, maxLength: 255 },
  { name: 'size', label: 'Kích cỡ', maxLength: 50 },
  { name: 'color', label: 'Màu sắc', maxLength: 50 },
  // Giá trị đền bù khi khách làm mất / hư không dùng lại được (đơn thuê chụp lại lúc đặt)
  { name: 'replacementValue', label: 'Giá trị thiết bị (VND, để đền bù)', type: 'number', min: 0 },
  {
    name: 'status',
    label: 'Trạng thái',
    type: 'select',
    required: true,
    options: [
      { value: 'Active', label: 'Hoạt động' },
      { value: 'Inactive', label: 'Tạm ngưng' },
    ],
  },
];

export default function ProductVariantTools({ productId, variant }) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pendingUrl, setPendingUrl] = useState(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const refresh = () => queryClient.invalidateQueries();
  const images = variant?.images ?? [];

  const attachImage = async (url) => {
    await axiosClient.post(api.IMAGES(variant.variantId), {
      imageUrl: url,
      isPrimary,
      displayOrder: Math.max(-1, ...images.map((image) => image.displayOrder)) + 1,
    });
    setPendingUrl(null);
    setIsPrimary(false);
    await refresh();
  };
  const upload = async (file) => {
    if (!file) return;
    setError('');
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      !/\.(jpe?g|png|webp)$/i.test(file.name)
    ) {
      setError('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.');
      return;
    }
    if (!file.size || file.size > 5 * 1024 * 1024) {
      setError('Ảnh phải có dung lượng từ 1 byte đến 5MB.');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await axiosClient.post(api.UPLOAD, form, { timeout: 60000 });
      const url = response.data.imageUrl;
      setPendingUrl(url);
      await attachImage(url);
    } catch (failure) {
      setError(failure.message || 'Không thể tải ảnh. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };
  const retryAttach = async () => {
    setBusy(true);
    setError('');
    try {
      await attachImage(pendingUrl);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.tools}>
      <div className={styles.actions}>
        <button type="button" className="btn btn-outline" onClick={() => setDialog({ type: 'variant' })}>
          {variant ? 'Sửa biến thể' : '＋ Thêm biến thể'}
        </button>
        {variant && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setTiers(
                variant.priceTiers.length
                  ? variant.priceTiers.map((tier) => ({ ...tier }))
                  : [{ minDays: 1, maxDays: '', dailyPrice: '' }],
              );
              setDialog({ type: 'prices' });
            }}
          >
            Bảng giá thuê
          </button>
        )}
      </div>
      {variant && (
        <>
          <div className={styles.gallery}>
            {images.map((image) => (
              <div key={image.imageId} className={styles.image}>
                <img src={image.imageUrl} alt={`Ảnh ${variant.name}`} loading="lazy" />
                <span>{image.isPrimary ? 'Ảnh đại diện' : 'Ảnh sản phẩm'}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDialog({ type: 'deleteImage', image })}
                  aria-label={`Xóa ảnh ${variant.name}${image.isPrimary ? ' đại diện' : ''}`}
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
          <div className={styles.upload}>
            <label>
              Thêm ảnh sản phẩm
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                disabled={busy || !!pendingUrl}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  upload(file);
                }}
              />
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={isPrimary}
                disabled={busy}
                onChange={(event) => setIsPrimary(event.target.checked)}
              />
              Đặt làm ảnh đại diện
            </label>
            <small>JPG, PNG, WebP · tối đa 5MB/ảnh</small>
            {busy && <span role="status">Đang tải và lưu ảnh…</span>}
            {pendingUrl && !busy && (
              <>
                <img
                  className={styles.preview}
                  src={pendingUrl}
                  alt="Ảnh đã tải lên, đang chờ lưu vào biến thể"
                />
                <button type="button" className="btn btn-outline" onClick={retryAttach}>
                  Thử lưu ảnh vào biến thể lại
                </button>
              </>
            )}
            {error && (
              <p className="text-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </>
      )}
      {dialog?.type === 'variant' && (
        <OperationDialog
          title={variant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể sản phẩm'}
          fields={variantFields}
          endpoint={variant ? api.VARIANT(variant.variantId) : api.VARIANTS(productId)}
          method={variant ? 'put' : 'post'}
          values={variant ? { ...variant, variantName: variant.name } : { status: 'Active' }}
          onSuccess={refresh}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.type === 'prices' && (
        <OperationDialog
          title={`Giá thuê · ${variant.name}`}
          fields={[]}
          endpoint={api.PRICE_TIERS(variant.variantId)}
          method="put"
          transform={() => ({ tiers: validatePriceTiers(tiers) })}
          onSuccess={refresh}
          onClose={() => setDialog(null)}
        >
          <p className={styles.hint}>
            Bắt đầu từ ngày 1, các bậc liên tục. Để trống ngày tối đa ở bậc cuối nếu không giới hạn.
          </p>
          <div className={styles.priceRows}>
            {tiers.map((tier, index) => (
              <div className={styles.priceRow} key={index}>
                {[
                  ['minDays', 'Từ ngày'],
                  ['maxDays', 'Đến ngày'],
                  ['dailyPrice', 'Giá/ngày (₫)'],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      min={key === 'dailyPrice' ? 0 : 1}
                      step={key === 'dailyPrice' ? '0.01' : 1}
                      required={key !== 'maxDays'}
                      value={tier[key] ?? ''}
                      onChange={(event) =>
                        setTiers((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, [key]: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={tiers.length === 1}
                  onClick={() => setTiers((current) => current.filter((_, i) => i !== index))}
                  aria-label={`Xóa bậc giá ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-outline"
            disabled={tiers.length >= 20}
            onClick={() =>
              setTiers((current) => [
                ...current,
                {
                  minDays: Number(current.at(-1)?.maxDays || current.at(-1)?.minDays || 0) + 1,
                  maxDays: '',
                  dailyPrice: '',
                },
              ])
            }
          >
            ＋ Thêm bậc giá
          </button>
        </OperationDialog>
      )}
      {dialog?.type === 'deleteImage' && (
        <OperationDialog
          title="Xóa ảnh khỏi sản phẩm"
          fields={[]}
          endpoint={api.IMAGE(variant.variantId, dialog.image.imageId)}
          method="delete"
          submitLabel="Xóa ảnh"
          onSuccess={refresh}
          onClose={() => setDialog(null)}
        >
          <p>Ảnh này sẽ không còn hiển thị trên sản phẩm.</p>
          <img className={styles.preview} src={dialog.image.imageUrl} alt="Ảnh cần xóa" />
        </OperationDialog>
      )}
    </div>
  );
}
