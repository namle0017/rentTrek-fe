import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useProductCategories } from '@/features/products/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import AdminCatalogStatusBadge from '../components/AdminCatalogStatusBadge';
import PriceTiersEditor from '../components/PriceTiersEditor';
import VariantPicker from '../components/VariantPicker';
import { PRODUCT_STATUS } from '../constants/adminCatalogStatus';
import {
  useAdminBundle,
  useDeleteBundle,
  useSetBundleItems,
  useSetBundlePriceTiers,
  useUpdateBundle,
} from '../hooks/useAdminCatalog';
import pageStyles from './AdminCatalogPage.module.css';
import styles from './AdminCatalogDetail.module.css';
import bundleStyles from './AdminBundle.module.css';

const formatDayRange = (tier) =>
  tier.maxDays ? `${tier.minDays}–${tier.maxDays} ngày` : `Từ ${tier.minDays} ngày`;

function InfoPanel({ bundle, isAdmin }) {
  const { data: categories = [] } = useProductCategories();
  const updateBundle = useUpdateBundle();

  if (!isAdmin) {
    return (
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Thông tin chung</h2>
        <dl className={styles.facts}>
          <div>
            <dt>Danh mục</dt>
            <dd>{bundle.categoryName}</dd>
          </div>
          <div>
            <dt>Ngày tạo</dt>
            <dd>{formatDate(bundle.createdAt)}</dd>
          </div>
        </dl>
        {bundle.description && <p className={styles.description}>{bundle.description}</p>}
      </section>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateBundle.mutate({
      bundleId: bundle.bundleId,
      name: form.get('name').trim(),
      categoryId: form.get('categoryId'),
      description: form.get('description').trim() || null,
      status: form.get('status'),
    });
  };

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Thông tin chung</h2>
      <form className={bundleStyles.form} onSubmit={handleSubmit}>
        <label className={pageStyles.field}>
          <span>Tên combo</span>
          <input name="name" required maxLength="255" defaultValue={bundle.name} />
        </label>
        <div className={bundleStyles.row}>
          <label className={pageStyles.field}>
            <span>Danh mục</span>
            <select name="categoryId" required defaultValue={bundle.categoryId}>
              {/* Danh mục hiện tại có thể đã ẩn khỏi danh sách công khai */}
              {!categories.some((category) => category.id === bundle.categoryId) && (
                <option value={bundle.categoryId}>{bundle.categoryName}</option>
              )}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className={pageStyles.field}>
            <span>Trạng thái</span>
            <select name="status" defaultValue={bundle.status}>
              <option value={PRODUCT_STATUS.ACTIVE}>Đang cho thuê</option>
              <option value={PRODUCT_STATUS.INACTIVE}>Ngừng cho thuê</option>
            </select>
          </label>
        </div>
        <label className={pageStyles.field}>
          <span>Mô tả</span>
          <textarea name="description" maxLength="4000" defaultValue={bundle.description ?? ''} />
        </label>
        <div className={bundleStyles.actions}>
          <button type="submit" className="btn btn-primary" disabled={updateBundle.isPending}>
            {updateBundle.isPending ? 'Đang lưu…' : 'Lưu thông tin'}
          </button>
        </div>
      </form>
    </section>
  );
}

function ItemsPanel({ bundle, isAdmin }) {
  const [items, setItems] = useState(bundle.items);
  const setBundleItems = useSetBundleItems();

  const addItem = (item) =>
    setItems((current) => {
      const existing = current.find((row) => row.productVariantId === item.productVariantId);
      if (!existing) return [...current, item];
      return current.map((row) =>
        row === existing ? { ...row, quantity: Number(row.quantity) + item.quantity } : row,
      );
    });

  const updateQuantity = (productVariantId, value) =>
    setItems((current) =>
      current.map((row) => (row.productVariantId === productVariantId ? { ...row, quantity: value } : row)),
    );

  const handleSave = () =>
    setBundleItems.mutate({
      bundleId: bundle.bundleId,
      items: items.map((row) => ({ productVariantId: row.productVariantId, quantity: Number(row.quantity) })),
    });

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Thành phần</h2>
      {items.length === 0 ? (
        <p className={styles.warn}>Chưa có thành phần, combo chưa thể bật cho thuê.</p>
      ) : (
        <table className={bundleStyles.table}>
          <thead>
            <tr>
              <th scope="col">Thiết bị</th>
              <th scope="col">SKU</th>
              <th scope="col">Số lượng</th>
              {isAdmin && <th scope="col" aria-label="Thao tác" />}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.productVariantId}>
                <td>
                  {row.productName} – {row.variantName}
                  {row.isActive === false && <span className={styles.warn}> (ngừng bán)</span>}
                </td>
                <td>{row.sku}</td>
                <td>
                  {isAdmin ? (
                    <input
                      type="number"
                      min="1"
                      aria-label={`Số lượng ${row.variantName}`}
                      value={row.quantity}
                      onChange={(event) => updateQuantity(row.productVariantId, event.target.value)}
                    />
                  ) : (
                    row.quantity
                  )}
                </td>
                {isAdmin && (
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        setItems((current) =>
                          current.filter((item) => item.productVariantId !== row.productVariantId),
                        )
                      }
                    >
                      Bỏ
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isAdmin && (
        <>
          <VariantPicker onAdd={addItem} />
          <div className={bundleStyles.actions}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={setBundleItems.isPending}
              onClick={handleSave}
            >
              {setBundleItems.isPending ? 'Đang lưu…' : 'Lưu thành phần'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function TiersPanel({ bundle, isAdmin }) {
  const setBundlePriceTiers = useSetBundlePriceTiers();
  const tiers = bundle.priceTiers;

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Bảng giá</h2>
      {isAdmin ? (
        <PriceTiersEditor
          initialTiers={tiers}
          isPending={setBundlePriceTiers.isPending}
          onSave={(next) => setBundlePriceTiers.mutate({ bundleId: bundle.bundleId, tiers: next })}
        />
      ) : tiers.length ? (
        <ul className={styles.tiers}>
          {tiers.map((tier) => (
            <li key={tier.minDays}>
              {formatDayRange(tier)}: <strong>{formatCurrency(tier.dailyPrice)}</strong>/ngày
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.warn}>Chưa có bảng giá, khách chưa thuê được combo này.</p>
      )}
    </section>
  );
}

export default function AdminBundleDetailPage() {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const { data: bundle, isLoading, isError, error, refetch } = useAdminBundle(bundleId);
  const deleteBundle = useDeleteBundle();

  const handleDelete = () => {
    if (!window.confirm(`Xóa combo "${bundle.name}"? Không thể hoàn tác.`)) return;
    deleteBundle.mutate(bundle.bundleId, { onSuccess: () => navigate(ROUTES.ADMIN_BUNDLES) });
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

    return (
      <div className={styles.layout}>
        <div className={styles.main}>
          <InfoPanel key={bundle.updatedAt} bundle={bundle} isAdmin={isAdmin} />
          <ItemsPanel bundle={bundle} isAdmin={isAdmin} />
          <TiersPanel bundle={bundle} isAdmin={isAdmin} />
        </div>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Trạng thái</h2>
            <p className={styles.statusNow}>
              <AdminCatalogStatusBadge status={bundle.status} />
            </p>
            <p className={styles.hint}>Cập nhật lúc {formatDate(bundle.updatedAt)}</p>
          </section>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={deleteBundle.isPending}
              onClick={handleDelete}
            >
              {deleteBundle.isPending ? 'Đang xóa…' : 'Xóa combo'}
            </button>
          )}
          {bundle.status === PRODUCT_STATUS.ACTIVE && (
            <Link
              to={ROUTES.BUNDLE_DETAIL(bundle.bundleId)}
              className={styles.inlineLink}
              target="_blank"
              rel="noreferrer"
            >
              Xem trang công khai ↗
            </Link>
          )}
        </aside>
      </div>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="admin-bundle-detail-title">
      <header>
        <p className={styles.eyebrow}>
          <Link to={ROUTES.ADMIN_BUNDLES}>Combo</Link> / Chi tiết
        </p>
        <h1 id="admin-bundle-detail-title" className={styles.title}>
          {bundle?.name ?? 'Chi tiết combo'}
        </h1>
      </header>
      {renderContent()}
    </section>
  );
}
