import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { USER_ROLE } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { useProductCategories } from '@/features/products/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import AdminCatalogStatusBadge from '../components/AdminCatalogStatusBadge';
import { BUNDLE_STATUS_OPTIONS } from '../constants/adminCatalogStatus';
import { useAdminBundles, useCreateBundle } from '../hooks/useAdminCatalog';
import styles from './AdminCatalogPage.module.css';
import bundleStyles from './AdminBundle.module.css';

const INITIAL_FILTERS = { search: '', status: '', categoryId: '' };
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' });

function CreateBundleModal({ categories, onClose }) {
  const navigate = useNavigate();
  const createBundle = useCreateBundle();

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // Combo mới chưa có thành phần nên BE chỉ cho tạo ở trạng thái nháp
    createBundle.mutate(
      {
        name: form.get('name').trim(),
        categoryId: form.get('categoryId'),
        description: form.get('description').trim() || null,
        status: 'Draft',
      },
      { onSuccess: (response) => navigate(ROUTES.ADMIN_BUNDLE_DETAIL(response.data)) },
    );
  };

  return (
    <Modal title="Tạo combo" onClose={onClose}>
      <form className={bundleStyles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Tên combo</span>
          <input name="name" required maxLength="255" />
        </label>
        <label className={styles.field}>
          <span>Danh mục</span>
          <select name="categoryId" required defaultValue="">
            <option value="" disabled>
              Chọn danh mục
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Mô tả</span>
          <textarea name="description" maxLength="4000" />
        </label>
        <p className={styles.resultMeta}>Combo được tạo ở trạng thái nháp. Thêm thành phần rồi mới bật cho thuê.</p>
        <div className={bundleStyles.actions}>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={createBundle.isPending}>
            {createBundle.isPending ? 'Đang tạo…' : 'Tạo combo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminBundlesPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [isCreating, setIsCreating] = useState(false);
  const { data: categories = [] } = useProductCategories();
  const params = { pageNumber, pageSize: DEFAULT_PAGE_SIZE, ...filters };
  const { data: pagedBundles, isLoading, isError, error, refetch, isFetching } = useAdminBundles(params);

  const setDraft = (key) => (event) => setDraftFilters((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setPageNumber(DEFAULT_PAGE_NUMBER);
    setFilters({ ...draftFilters, search: draftFilters.search.trim() });
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!pagedBundles?.items.length) return <EmptyState message="Chưa có combo phù hợp với bộ lọc" />;

    return (
      <>
        <p className={styles.resultMeta} role="status">
          {isFetching ? 'Đang cập nhật danh sách…' : `${pagedBundles.totalItems} combo`}
        </p>
        <div className={styles.tableCard} aria-busy={isFetching}>
          <div className={styles.tableScroll} tabIndex="0" aria-label="Bảng combo, cuộn ngang trên màn hình nhỏ">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Combo</th>
                  <th scope="col">Danh mục</th>
                  <th scope="col">Thành phần</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {pagedBundles.items.map((bundle) => (
                  <tr
                    key={bundle.bundleId}
                    className={styles.clickableRow}
                    onClick={() => navigate(ROUTES.ADMIN_BUNDLE_DETAIL(bundle.bundleId))}
                  >
                    <td>
                      <Link to={ROUTES.ADMIN_BUNDLE_DETAIL(bundle.bundleId)} className={styles.entityName}>
                        {bundle.name}
                      </Link>
                    </td>
                    <td>{bundle.categoryName}</td>
                    <td className={styles.numeric}>{bundle.itemsCount} thành phần</td>
                    <td>
                      <AdminCatalogStatusBadge status={bundle.status} />
                    </td>
                    <td className={styles.date}>{dateFormatter.format(new Date(bundle.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          pageNumber={pagedBundles.pageNumber}
          totalPages={pagedBundles.totalPages}
          hasPrevious={pagedBundles.hasPrevious}
          hasNext={pagedBundles.hasNext}
          onPageChange={setPageNumber}
        />
      </>
    );
  };

  return (
    <section className={styles.page} aria-label="Combo thiết bị">
      {isAdmin && (
        <div className={bundleStyles.toolbar}>
          <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>
            + Tạo combo
          </button>
        </div>
      )}

      <form className={`${styles.filters} ${bundleStyles.filters}`} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Tìm combo</span>
          <input
            type="search"
            value={draftFilters.search}
            placeholder="Tên combo"
            maxLength="200"
            onChange={setDraft('search')}
          />
        </label>
        <label className={styles.field}>
          <span>Trạng thái</span>
          <select value={draftFilters.status} onChange={setDraft('status')}>
            {BUNDLE_STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Danh mục</span>
          <select value={draftFilters.categoryId} onChange={setDraft('categoryId')}>
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={`btn btn-primary ${styles.filterButton}`}>
          Lọc danh sách
        </button>
      </form>

      {renderContent()}

      {isCreating && <CreateBundleModal categories={categories} onClose={() => setIsCreating(false)} />}
    </section>
  );
}
