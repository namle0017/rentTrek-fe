import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/api/endpoints';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import OperationDialog from '@/features/operations/components/OperationDialog';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLE } from '@/constants/enums';
import ProductVariantTools from '../components/ProductVariantTools';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import AdminCatalogStatusBadge from '../components/AdminCatalogStatusBadge';
import { PRODUCT_STATUS } from '../constants/adminCatalogStatus';
import { useAdminProduct } from '../hooks/useAdminCatalog';
import styles from './AdminCatalogDetail.module.css';

const formatDayRange = (tier) =>
  tier.maxDays ? `${tier.minDays}–${tier.maxDays} ngày` : `Từ ${tier.minDays} ngày`;

export default function AdminProductDetailPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const { productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(false);
  const { data: product, isLoading, isError, error, refetch } = useAdminProduct(productId);

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

    return (
      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Thông tin chung</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Danh mục</dt>
                <dd>{product.categoryName}</dd>
              </div>
              <div>
                <dt>Số biến thể</dt>
                <dd>{product.variants.length}</dd>
              </div>
              <div>
                <dt>Ngày tạo</dt>
                <dd>{formatDate(product.createdAt)}</dd>
              </div>
            </dl>
            {product.description && <p className={styles.description}>{product.description}</p>}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Biến thể</h2>
            {isAdmin && <ProductVariantTools productId={product.productId} />}
            {product.variants.length === 0 ? (
              <p className={styles.hint}>Chưa có biến thể.</p>
            ) : (
              <ul className={styles.variantList}>
                {product.variants.map((variant) => (
                  <li key={variant.variantId} className={styles.variant}>
                    {variant.imageUrls[0] ? (
                      <img src={variant.imageUrls[0]} alt={`Ảnh ${variant.name}`} loading="lazy" />
                    ) : (
                      <span className={styles.imageFallback} aria-hidden="true">
                        {variant.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className={styles.variantBody}>
                      <p className={styles.variantHead}>
                        <strong>{variant.name}</strong>
                        <AdminCatalogStatusBadge status={variant.status} />
                      </p>
                      <p className={styles.muted}>
                        SKU {variant.sku}
                        {variant.size && ` · Cỡ ${variant.size}`}
                        {variant.color && ` · Màu ${variant.color}`}
                      </p>
                      <p>
                        Thiết bị sẵn sàng:{' '}
                        <strong>
                          {variant.availableAssetsCount} / {variant.totalAssetsCount}
                        </strong>
                      </p>
                      {variant.priceTiers.length ? (
                        <ul className={styles.tiers}>
                          {variant.priceTiers.map((tier) => (
                            <li key={tier.minDays}>
                              {formatDayRange(tier)}: <strong>{formatCurrency(tier.dailyPrice)}</strong>/ngày
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.warn}>Chưa có bảng giá, khách chưa thuê được biến thể này.</p>
                      )}
                      {isAdmin && <ProductVariantTools productId={product.productId} variant={variant} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Trạng thái</h2>
            {isAdmin && (
              <>
                <Link className="btn btn-primary" to={ROUTES.ADMIN_PRODUCT_EDIT(product.productId)}>
                  Chỉnh sửa sản phẩm
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setConfirmDeleteProduct(true)}
                >
                  Xóa sản phẩm
                </button>
              </>
            )}
            <p className={styles.statusNow}>
              <AdminCatalogStatusBadge status={product.status} />
            </p>
          </section>
          {product.status === PRODUCT_STATUS.ACTIVE && (
            <Link
              to={ROUTES.PRODUCT_DETAIL(product.productId)}
              className={styles.inlineLink}
              target="_blank"
              rel="noreferrer"
            >
              Xem trang công khai ↗
            </Link>
          )}
        </aside>
        {confirmDeleteProduct && (
          <OperationDialog
            title="Xóa sản phẩm"
            fields={[]}
            endpoint={API_ENDPOINTS.PRODUCT_MANAGEMENT.BY_ID(product.productId)}
            method="delete"
            submitLabel="Xác nhận xóa"
            onSuccess={() => {
              queryClient.invalidateQueries();
              navigate(ROUTES.ADMIN_PRODUCTS);
            }}
            onClose={() => setConfirmDeleteProduct(false)}
          >
            <p>
              Bạn có chắc chắn muốn xóa sản phẩm <strong>{product.name}</strong>? Sản phẩm và các biến thể sẽ bị ẩn khỏi danh sách vận hành và trang công khai.
            </p>
          </OperationDialog>
        )}
      </div>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="admin-product-detail-title">
      <header>
        <p className={styles.eyebrow}>
          <Link to={ROUTES.ADMIN_PRODUCTS}>Sản phẩm</Link> / Chi tiết
        </p>
        <h1 id="admin-product-detail-title" className={styles.title}>
          {product?.name ?? 'Chi tiết sản phẩm'}
        </h1>
      </header>
      {renderContent()}
    </section>
  );
}
