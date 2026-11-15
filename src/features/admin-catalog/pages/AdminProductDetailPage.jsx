import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Boxes,
  Calendar,
  ExternalLink,
  Layers,
  Pencil,
  Warehouse,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/api/endpoints';
import Breadcrumb from '@/components/Breadcrumb';
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
  const [confirmToggleStatus, setConfirmToggleStatus] = useState(false);
  const { data: product, isLoading, isError, error, refetch } = useAdminProduct(productId);

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

    const variants = product.variants || [];
    const totalAvailableAssets = variants.reduce(
      (sum, v) => sum + (v.availableAssetsCount || 0),
      0,
    );
    const totalAssets = variants.reduce(
      (sum, v) => sum + (v.totalAssetsCount || 0),
      0,
    );

    return (
      <div className={styles.layout}>
        {/* CỘT CHÍNH (65%): Thông tin chung, Tổng quan kho, Quản lý Biến thể */}
        <div className={styles.main}>
          {/* 1. Tổng quan Sản phẩm & Tồn kho */}
          <section className={styles.panel} aria-label="Tổng quan sản phẩm và tồn kho">
            <h2 className={styles.panelTitle}>Thông tin chung</h2>
            <div className={styles.factGrid}>
              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <Layers size={14} /> Danh mục
                </span>
                <strong className={styles.factValue}>{product.categoryName}</strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <Boxes size={14} /> Biến thể SKU
                </span>
                <strong className={styles.factValue}>{variants.length} biến thể</strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <Warehouse size={14} /> Sẵn sàng cho thuê
                </span>
                <strong className={styles.factValue}>
                  {totalAvailableAssets} / {totalAssets}
                  <small className={styles.factUnit}> thiết bị</small>
                </strong>
              </div>

              <div className={styles.factItem}>
                <span className={styles.factLabel}>
                  <Calendar size={14} /> Ngày tạo
                </span>
                <strong className={styles.factValue}>{formatDate(product.createdAt)}</strong>
              </div>
            </div>

            {product.description && (
              <div className={styles.descriptionBox}>
                <h3 className={styles.descriptionTitle}>Mô tả sản phẩm</h3>
                <p className={styles.description}>{product.description}</p>
              </div>
            )}
          </section>

          {/* 2. Quản lý Biến thể (Variant Manager) */}
          <section className={styles.panel} aria-label="Danh sách biến thể SKU và bảng giá">
            <div className={styles.panelHeaderRow}>
              <div>
                <h2 className={styles.panelTitle}>Biến thể sản phẩm ({variants.length})</h2>
                <span className={styles.panelSubtitle}>
                  Quản lý SKU, hình ảnh, tồn kho và bảng giá thuê theo ngày
                </span>
              </div>
              {isAdmin && (
                <div className={styles.panelHeaderAction}>
                  <ProductVariantTools productId={product.productId} />
                </div>
              )}
            </div>

            {variants.length === 0 ? (
              <div className={styles.emptyTripsBox}>
                <p className={styles.hint}>Chưa có biến thể nào được tạo cho sản phẩm này.</p>
                {isAdmin && <ProductVariantTools productId={product.productId} />}
              </div>
            ) : (
              <div className={styles.variantCardsGrid}>
                {variants.map((variant) => {
                  const available = variant.availableAssetsCount || 0;
                  const total = variant.totalAssetsCount || 0;
                  const percent = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;

                  return (
                    <article key={variant.variantId} className={styles.variantDetailCard}>
                      <div className={styles.variantMediaCol}>
                        {variant.imageUrls?.[0] ? (
                          <img
                            src={variant.imageUrls[0]}
                            alt={`Ảnh ${variant.name}`}
                            className={styles.variantCardImg}
                            loading="lazy"
                          />
                        ) : (
                          <div className={styles.variantImgFallback}>
                            {variant.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className={styles.variantContentCol}>
                        <div className={styles.variantHeaderLine}>
                          <div className={styles.variantTitleBlock}>
                            <h3 className={styles.variantCardTitle}>{variant.name}</h3>
                            <div className={styles.variantSpecTags}>
                              <span className={styles.skuTag}>SKU: {variant.sku}</span>
                              {variant.size && <span className={styles.attrTag}>Cỡ: {variant.size}</span>}
                              {variant.color && <span className={styles.attrTag}>Màu: {variant.color}</span>}
                              {variant.replacementValue != null && (
                                <span className={styles.attrTag}>
                                  Giá trị đền bù: {formatCurrency(variant.replacementValue)}
                                </span>
                              )}
                            </div>
                          </div>
                          <AdminCatalogStatusBadge status={variant.status} />
                        </div>

                        {/* Inventory Bar */}
                        <div className={styles.inventoryProgressRow}>
                          <div className={styles.inventoryTextLabel}>
                            <span>Tồn kho sẵn sàng:</span>
                            <strong>
                              {available} / {total} món
                            </strong>
                          </div>
                          <div className={styles.progressBarTrack} title={`${percent}% sẵn sàng`}>
                            <div
                              className={styles.progressBarFill}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Price Tiers */}
                        <div className={styles.priceTiersContainer}>
                          <span className={styles.priceTiersLabel}>Bảng giá thuê theo ngày:</span>
                          {variant.priceTiers?.length ? (
                            <div className={styles.tiersPillsList}>
                              {variant.priceTiers.map((tier) => (
                                <span key={tier.minDays} className={styles.tierPill}>
                                  <strong>{formatDayRange(tier)}:</strong>{' '}
                                  {formatCurrency(tier.dailyPrice)}/ngày
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className={styles.warnPill}>
                              Chưa có bảng giá (khách chưa thể thuê biến thể này)
                            </p>
                          )}
                        </div>

                        {isAdmin && (
                          <div className={styles.variantActionRow}>
                            <ProductVariantTools productId={product.productId} variant={variant} />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* CỘT PHỤ (35%): Trạng thái, Thao tác nhanh & Liên kết Kho */}
        <aside className={styles.side}>
          {/* Card Trạng thái & Tóm tắt */}
          <section className={styles.panel} aria-label="Trạng thái hiển thị sản phẩm">
            <h2 className={styles.panelTitle}>Trạng thái sản phẩm</h2>
            <div className={styles.statusDisplayRow}>
              <AdminCatalogStatusBadge status={product.status} />
              <span className={styles.statusSubtext}>
                {product.status === PRODUCT_STATUS.ACTIVE
                  ? 'Đang hiển thị công khai'
                  : 'Đang tạm ẩn / Nháp'}
              </span>
            </div>

            {isAdmin && (
              <>
                <Link
                  className={styles.editProductButton}
                  to={ROUTES.ADMIN_PRODUCT_EDIT(product.productId)}
                >
                  <Pencil size={15} /> Chỉnh sửa thông tin cơ bản
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setConfirmToggleStatus(true)}
                >
                  {product.status === PRODUCT_STATUS.ACTIVE
                    ? 'Tạm ngưng kinh doanh'
                    : 'Mở bán sản phẩm'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setConfirmDeleteProduct(true)}
                >
                  Xóa sản phẩm
                </button>
              </>
            )}
          </section>

          {/* Card Phím tắt Quản trị & Kho */}
          <section className={styles.panel} aria-label="Phím tắt vận hành">
            <h2 className={styles.panelTitle}>Thao tác kho & phân phối</h2>
            <div className={styles.quickOpsList}>
              <Link to="/ops/warehouse/assets" className={styles.quickOpLink}>
                <Warehouse size={15} />
                <span>Quản lý tài sản kho (Barcode)</span>
              </Link>
              <Link to={ROUTES.ADMIN_PRODUCTS} className={styles.quickOpLink}>
                <Boxes size={15} />
                <span>Xem danh sách sản phẩm</span>
              </Link>
              {product.status === PRODUCT_STATUS.ACTIVE && (
                <Link
                  to={ROUTES.PRODUCT_DETAIL(product.productId)}
                  className={styles.quickOpLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={15} />
                  <span>Xem trang công khai trên web</span>
                </Link>
              )}
            </div>
          </section>
        </aside>
        {confirmToggleStatus && (
          <OperationDialog
            title={
              product.status === PRODUCT_STATUS.ACTIVE
                ? 'Tạm ngưng kinh doanh sản phẩm'
                : 'Mở bán lại sản phẩm'
            }
            fields={[]}
            endpoint={API_ENDPOINTS.PRODUCT_MANAGEMENT.STATUS(product.productId)}
            method="patch"
            transform={() => ({
              status: product.status === PRODUCT_STATUS.ACTIVE ? 'Inactive' : 'Active',
            })}
            submitLabel="Xác nhận đổi trạng thái"
            onSuccess={() => {
              queryClient.invalidateQueries();
              setConfirmToggleStatus(false);
            }}
            onClose={() => setConfirmToggleStatus(false)}
          >
            <p>
              Bạn có chắc chắn muốn chuyển trạng thái sản phẩm <strong>{product.name}</strong> sang{' '}
              <strong>
                {product.status === PRODUCT_STATUS.ACTIVE ? 'Tạm ngưng (Inactive)' : 'Hoạt động (Active)'}
              </strong>
              ?
            </p>
          </OperationDialog>
        )}
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
      <header className={styles.pageHeader}>
        <Breadcrumb
          items={[
            { label: 'Quản lý Sản phẩm', to: ROUTES.ADMIN_PRODUCTS },
            product?.categoryName ? { label: product.categoryName } : null,
            product?.name ? { label: product.name } : { label: 'Chi tiết sản phẩm' },
          ]}
          isLoading={isLoading}
        />
        <div className={styles.titleRow}>
          <div className={styles.titleWithBadge}>
            <h1 id="admin-product-detail-title" className={styles.title}>
              {product?.name ?? 'Chi tiết sản phẩm'}
            </h1>
            {product?.status && <AdminCatalogStatusBadge status={product.status} />}
          </div>
          {product && (
            <div className={styles.headerToolbar}>
              {isAdmin && (
                <Link
                  className={styles.headerPrimaryBtn}
                  to={ROUTES.ADMIN_PRODUCT_EDIT(product.productId)}
                >
                  <Pencil size={14} /> Chỉnh sửa sản phẩm
                </Link>
              )}
              {product.status === PRODUCT_STATUS.ACTIVE && (
                <Link
                  to={ROUTES.PRODUCT_DETAIL(product.productId)}
                  className={styles.headerSecondaryBtn}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={14} /> Xem trang công khai
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {renderContent()}
    </section>
  );
}
