import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import AdminCatalogStatusBadge from '../components/AdminCatalogStatusBadge';
import VariantPicker from '../components/VariantPicker';
import { TOUR_STATUS, normalizeTourStatus } from '../constants/adminCatalogStatus';
import {
  useAddTourImage,
  useArchiveTour,
  useCloneTourVersion,
  useCreateTour,
  useCreateTourActivity,
  useCreateTourProvidedItem,
  useDeleteTour,
  useDeleteTourActivity,
  useDeleteTourImage,
  useDeleteTourProvidedItem,
  useLocationOptions,
  usePostOptions,
  usePublishTour,
  useReorderTourActivities,
  useReorderTourImages,
  useSetTourPosts,
  useSetTourPreparationItems,
  useTourActivities,
  useTourCategoryOptions,
  useTourForEdit,
  useTourImages,
  useTourPosts,
  useTourPreparationItems,
  useTourProvidedItems,
  useTourVersionDiff,
  useTourVersions,
  useUpdateTour,
  useUpdateTourActivity,
  useUpdateTourProvidedItem,
  useUploadImage,
} from '../hooks/useTourAuthoring';
import pageStyles from './AdminCatalogPage.module.css';
import styles from './AdminCatalogDetail.module.css';
import formStyles from './AdminBundle.module.css';

const QUANTITY_BASIS = { PerPerson: 'Mỗi khách', PerGroup: 'Mỗi nhóm', PerTrip: 'Mỗi chuyến' };

// Đổi chỗ phần tử index với phần tử kế bên (dir = -1 lên, 1 xuống)
const move = (list, index, dir) => {
  const next = [...list];
  [next[index], next[index + dir]] = [next[index + dir], next[index]];
  return next;
};

function QueryState({ query, children }) {
  if (query.isLoading) return <Spinner />;
  if (query.isError) return <ErrorState message={query.error?.message} onRetry={query.refetch} />;
  return children(query.data);
}

function InfoPanel({ tour }) {
  const navigate = useNavigate();
  const { data: categories = [] } = useTourCategoryOptions();
  const { data: locations = [] } = useLocationOptions();
  const createTour = useCreateTour();
  const updateTour = useUpdateTour();
  const pending = createTour.isPending || updateTour.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('name').trim(),
      categoryId: form.get('categoryId'),
      mainLocationId: form.get('mainLocationId'),
      description: form.get('description').trim() || null,
      durationDays: Number(form.get('durationDays')),
      durationNights: Number(form.get('durationNights')),
      durationMinutes: Number(form.get('durationMinutes')),
      basePrice: Number(form.get('basePrice')),
    };
    if (tour) updateTour.mutate({ tourId: tour.tourId, ...payload });
    else createTour.mutate(payload, { onSuccess: (res) => navigate(ROUTES.ADMIN_TOUR_EDIT(res.data)) });
  };

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Thông tin chung</h2>
      <form className={formStyles.form} onSubmit={handleSubmit}>
        <label className={pageStyles.field}>
          <span>Tên tour</span>
          <input name="name" required maxLength="255" defaultValue={tour?.name} />
        </label>
        <div className={formStyles.row}>
          <label className={pageStyles.field}>
            <span>Danh mục</span>
            <select name="categoryId" required defaultValue={tour?.categoryId ?? ''}>
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className={pageStyles.field}>
            <span>Địa điểm chính</span>
            <select name="mainLocationId" required defaultValue={tour?.mainLocationId ?? ''}>
              <option value="">Chọn địa điểm</option>
              {locations.map((location) => (
                <option key={location.locationId} value={location.locationId}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={formStyles.row}>
          <label className={pageStyles.field}>
            <span>Số ngày</span>
            <input name="durationDays" type="number" min="1" max="365" required defaultValue={tour?.durationDays ?? 1} />
          </label>
          <label className={pageStyles.field}>
            <span>Số đêm</span>
            <input name="durationNights" type="number" min="0" max="365" required defaultValue={tour?.durationNights ?? 0} />
          </label>
          <label className={pageStyles.field}>
            <span>Tổng thời lượng (phút)</span>
            <input name="durationMinutes" type="number" min="1" required defaultValue={tour?.durationMinutes ?? 480} />
          </label>
          <label className={pageStyles.field}>
            <span>Giá cơ sở (VND/người)</span>
            <input name="basePrice" type="number" min="0" step="1000" required defaultValue={tour?.basePrice ?? 0} />
          </label>
        </div>
        <label className={pageStyles.field}>
          <span>Mô tả</span>
          <textarea name="description" maxLength="4000" defaultValue={tour?.description ?? ''} />
        </label>
        <div className={formStyles.actions}>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? 'Đang lưu…' : tour ? 'Lưu thông tin' : 'Tạo tour nháp'}
          </button>
        </div>
      </form>
    </section>
  );
}

function StatusPanel({ tour }) {
  const navigate = useNavigate();
  const publish = usePublishTour();
  const archive = useArchiveTour();
  const remove = useDeleteTour();
  const status = normalizeTourStatus(tour.status);
  const pending = publish.isPending || archive.isPending || remove.isPending;

  const handleDelete = () => {
    if (!window.confirm(`Xóa tour "${tour.name}"? Chỉ xóa được khi chưa có chuyến.`)) return;
    remove.mutate(tour.tourId, { onSuccess: () => navigate(ROUTES.ADMIN_TOURS) });
  };

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Trạng thái · phiên bản {tour.version}</h2>
      <p className={styles.statusNow}>
        <AdminCatalogStatusBadge status={status} />
      </p>
      {tour.isItineraryLocked && (
        <p className={styles.warn}>
          Lịch trình đã khóa từ {formatDateTime(tour.itineraryLockedAt)}. Muốn sửa hoạt động / đồ cấp, hãy tạo phiên bản mới.
        </p>
      )}
      <div className={formStyles.actions}>
        {status !== TOUR_STATUS.PUBLISHED && (
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => publish.mutate(tour.tourId)}>
            Xuất bản
          </button>
        )}
        {status === TOUR_STATUS.PUBLISHED && (
          <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => archive.mutate(tour.tourId)}>
            Lưu trữ
          </button>
        )}
        <button type="button" className="btn btn-outline" disabled={pending} onClick={handleDelete}>
          Xóa tour
        </button>
      </div>
      <Link to={ROUTES.ADMIN_TOUR_DETAIL(tour.tourId)} className={styles.inlineLink}>
        Xem chi tiết →
      </Link>
    </section>
  );
}

function ImagesPanel({ tourId }) {
  const query = useTourImages(tourId);
  const upload = useUploadImage();
  const add = useAddTourImage();
  const reorder = useReorderTourImages();
  const remove = useDeleteTourImage();
  const pending = upload.isPending || add.isPending || reorder.isPending || remove.isPending;

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Ảnh tour</h2>
      <QueryState query={query}>
        {(data) => {
          const images = [...data].sort((a, b) => a.displayOrder - b.displayOrder);
          const ids = images.map((image) => image.imageId);
          const primaryId = images.find((image) => image.isPrimary)?.imageId ?? null;
          const save = (imageIdsInOrder, primaryImageId = primaryId) =>
            reorder.mutate({ tourId, imageIdsInOrder, primaryImageId });

          const handleFile = (event) => {
            const file = event.target.files[0];
            event.target.value = '';
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            upload.mutate(formData, {
              onSuccess: (res) =>
                add.mutate({
                  tourId,
                  imageUrl: res.data.imageUrl,
                  displayOrder: images.length,
                  isPrimary: images.length === 0,
                }),
            });
          };

          return (
            <>
              {images.length === 0 && <p className={styles.hint}>Chưa có ảnh.</p>}
              <ul className={styles.list}>
                {images.map((image, index) => (
                  <li key={image.imageId} className={formStyles.row}>
                    <img src={image.imageUrl} alt={`Ảnh ${index + 1}`} width="96" height="64" style={{ objectFit: 'cover' }} />
                    {image.isPrimary ? (
                      <strong>Ảnh chính</strong>
                    ) : (
                      <button type="button" className="btn btn-outline" disabled={pending} onClick={() => save(ids, image.imageId)}>
                        Đặt làm ảnh chính
                      </button>
                    )}
                    <button type="button" className="btn btn-outline" aria-label="Lên" disabled={pending || index === 0} onClick={() => save(move(ids, index, -1))}>
                      ↑
                    </button>
                    <button type="button" className="btn btn-outline" aria-label="Xuống" disabled={pending || index === images.length - 1} onClick={() => save(move(ids, index, 1))}>
                      ↓
                    </button>
                    <button type="button" className="btn btn-outline" disabled={pending} onClick={() => remove.mutate({ tourId, imageId: image.imageId })}>
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
              <label className={pageStyles.field}>
                <span>{upload.isPending ? 'Đang tải ảnh…' : 'Thêm ảnh (JPG/PNG/WebP)'}</span>
                <input type="file" accept="image/*" disabled={pending} onChange={handleFile} />
              </label>
            </>
          );
        }}
      </QueryState>
    </section>
  );
}

function ActivityForm({ tourId, activity, onDone }) {
  const create = useCreateTourActivity();
  const update = useUpdateTourActivity();
  const pending = create.isPending || update.isPending;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      tourId,
      dayNumber: Number(form.get('dayNumber')),
      dayTitle: form.get('dayTitle').trim() || null,
      startTime: `${form.get('startTime')}:00`,
      durationMinutes: Number(form.get('durationMinutes')),
      name: form.get('name').trim(),
      description: form.get('description').trim() || null,
    };
    if (activity) {
      update.mutate({ ...payload, activityId: activity.activityId, displayOrder: activity.displayOrder }, { onSuccess: onDone });
    } else {
      create.mutate(payload, { onSuccess: () => formEl.reset() });
    }
  };

  return (
    <form className={formStyles.form} onSubmit={handleSubmit}>
      <h3>{activity ? `Sửa: ${activity.name}` : 'Thêm hoạt động'}</h3>
      <div className={formStyles.row}>
        <label className={pageStyles.field}>
          <span>Ngày</span>
          <input name="dayNumber" type="number" min="1" required defaultValue={activity?.dayNumber ?? 1} />
        </label>
        <label className={pageStyles.field}>
          <span>Tiêu đề ngày</span>
          <input name="dayTitle" maxLength="255" defaultValue={activity?.dayTitle ?? ''} />
        </label>
        <label className={pageStyles.field}>
          <span>Giờ bắt đầu</span>
          <input name="startTime" type="time" required defaultValue={activity?.startTime?.slice(0, 5) ?? '06:00'} />
        </label>
        <label className={pageStyles.field}>
          <span>Thời lượng (phút)</span>
          <input name="durationMinutes" type="number" min="1" required defaultValue={activity?.durationMinutes ?? 60} />
        </label>
      </div>
      <label className={pageStyles.field}>
        <span>Tên hoạt động</span>
        <input name="name" required maxLength="255" defaultValue={activity?.name ?? ''} />
      </label>
      <label className={pageStyles.field}>
        <span>Mô tả</span>
        <textarea name="description" maxLength="4000" defaultValue={activity?.description ?? ''} />
      </label>
      <div className={formStyles.actions}>
        {activity && (
          <button type="button" className="btn btn-outline" onClick={onDone}>
            Hủy sửa
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Đang lưu…' : activity ? 'Lưu hoạt động' : 'Thêm hoạt động'}
        </button>
      </div>
    </form>
  );
}

function ActivitiesPanel({ tourId, locked }) {
  const query = useTourActivities(tourId);
  const [editing, setEditing] = useState(null);
  const reorder = useReorderTourActivities();
  const remove = useDeleteTourActivity();
  const pending = reorder.isPending || remove.isPending;

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Lịch trình</h2>
      <QueryState query={query}>
        {(activities) => {
          const days = [...new Set(activities.map((a) => a.dayNumber))].sort((a, b) => a - b);
          return (
            <>
              {days.length === 0 && <p className={styles.hint}>Chưa có hoạt động.</p>}
              {days.map((day) => {
                const rows = activities.filter((a) => a.dayNumber === day).sort((a, b) => a.displayOrder - b.displayOrder);
                const ids = rows.map((a) => a.activityId);
                const save = (activityIdsInOrder) => reorder.mutate({ tourId, dayNumber: day, activityIdsInOrder });
                return (
                  <div key={day} className={styles.day}>
                    <h3>
                      Ngày {day}
                      {rows[0].dayTitle && ` · ${rows[0].dayTitle}`}
                    </h3>
                    <ol className={styles.list}>
                      {rows.map((a, index) => (
                        <li key={a.activityId} className={formStyles.row}>
                          <span style={{ flex: 1 }}>
                            <strong>{a.startTime.slice(0, 5)}</strong> {a.name}{' '}
                            <span className={styles.muted}>({a.durationMinutes} phút)</span>
                          </span>
                          {!locked && (
                            <>
                              <button type="button" className="btn btn-outline" aria-label="Lên" disabled={pending || index === 0} onClick={() => save(move(ids, index, -1))}>
                                ↑
                              </button>
                              <button type="button" className="btn btn-outline" aria-label="Xuống" disabled={pending || index === rows.length - 1} onClick={() => save(move(ids, index, 1))}>
                                ↓
                              </button>
                              <button type="button" className="btn btn-outline" onClick={() => setEditing(a)}>
                                Sửa
                              </button>
                              <button type="button" className="btn btn-outline" disabled={pending} onClick={() => remove.mutate({ tourId, activityId: a.activityId })}>
                                Xóa
                              </button>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
              {locked ? (
                <p className={styles.hint}>Lịch trình đã khóa, không sửa được.</p>
              ) : (
                <ActivityForm
                  key={editing?.activityId ?? 'new'}
                  tourId={tourId}
                  activity={editing}
                  onDone={() => setEditing(null)}
                />
              )}
            </>
          );
        }}
      </QueryState>
    </section>
  );
}

function PreparationEditor({ tourId, initialItems }) {
  const [items, setItems] = useState(initialItems.map(({ itemName, note }) => ({ itemName, note: note ?? '' })));
  const save = useSetTourPreparationItems();
  const update = (index, key, value) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  return (
    <>
      {items.map((item, index) => (
        <div key={index} className={formStyles.row}>
          <label className={pageStyles.field}>
            <span>Vật dụng</span>
            <input value={item.itemName} maxLength="255" onChange={(e) => update(index, 'itemName', e.target.value)} />
          </label>
          <label className={pageStyles.field}>
            <span>Ghi chú</span>
            <input value={item.note} maxLength="1000" onChange={(e) => update(index, 'note', e.target.value)} />
          </label>
          <button type="button" className="btn btn-outline" onClick={() => setItems((c) => c.filter((_, i) => i !== index))}>
            Bỏ
          </button>
        </div>
      ))}
      <div className={formStyles.actions}>
        <button type="button" className="btn btn-outline" onClick={() => setItems((c) => [...c, { itemName: '', note: '' }])}>
          + Thêm vật dụng
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={save.isPending || items.some((item) => !item.itemName.trim())}
          onClick={() =>
            save.mutate({
              tourId,
              items: items.map((item) => ({ itemName: item.itemName.trim(), note: item.note.trim() || null })),
            })
          }
        >
          {save.isPending ? 'Đang lưu…' : 'Lưu danh sách'}
        </button>
      </div>
    </>
  );
}

function PreparationPanel({ tourId }) {
  const query = useTourPreparationItems(tourId);
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Khách tự chuẩn bị</h2>
      <QueryState query={query}>
        {(items) => <PreparationEditor key={query.dataUpdatedAt} tourId={tourId} initialItems={items} />}
      </QueryState>
    </section>
  );
}

function ProvidedRow({ tourId, item, locked }) {
  const [draft, setDraft] = useState({ quantity: item.quantity, quantityBasis: item.quantityBasis, note: item.note ?? '' });
  const update = useUpdateTourProvidedItem();
  const remove = useDeleteTourProvidedItem();
  const set = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  return (
    <tr>
      <td>
        {item.productName} – {item.variantName}
        <div className={styles.muted}>{item.sku}</div>
      </td>
      <td>
        <input type="number" min="1" aria-label="Số lượng" disabled={locked} value={draft.quantity} onChange={set('quantity')} />
      </td>
      <td>
        <select aria-label="Cơ sở tính" disabled={locked} value={draft.quantityBasis} onChange={set('quantityBasis')}>
          {Object.entries(QUANTITY_BASIS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input aria-label="Ghi chú" maxLength="1000" disabled={locked} value={draft.note} onChange={set('note')} />
      </td>
      {!locked && (
        <td className={formStyles.actions}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={update.isPending}
            onClick={() =>
              update.mutate({
                tourId,
                itemId: item.tourProvidedItemId,
                productVariantId: item.productVariantId,
                quantity: Number(draft.quantity),
                quantityBasis: draft.quantityBasis,
                note: draft.note.trim() || null,
              })
            }
          >
            Lưu
          </button>
          <button
            type="button"
            className="btn btn-outline"
            disabled={remove.isPending}
            onClick={() => remove.mutate({ tourId, itemId: item.tourProvidedItemId })}
          >
            Xóa
          </button>
        </td>
      )}
    </tr>
  );
}

function ProvidedPanel({ tourId, locked }) {
  const query = useTourProvidedItems(tourId);
  const [basis, setBasis] = useState('PerPerson');
  const create = useCreateTourProvidedItem();

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Đồ được cấp theo tour</h2>
      <QueryState query={query}>
        {(items) =>
          items.length === 0 ? (
            <p className={styles.hint}>Chưa có đồ cấp.</p>
          ) : (
            <table className={formStyles.table}>
              <thead>
                <tr>
                  <th scope="col">Thiết bị</th>
                  <th scope="col">Số lượng</th>
                  <th scope="col">Cơ sở tính</th>
                  <th scope="col">Ghi chú</th>
                  {!locked && <th scope="col" aria-label="Thao tác" />}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <ProvidedRow key={`${item.tourProvidedItemId}-${query.dataUpdatedAt}`} tourId={tourId} item={item} locked={locked} />
                ))}
              </tbody>
            </table>
          )
        }
      </QueryState>
      {!locked && (
        <VariantPicker
          onAdd={(item) =>
            create.mutate({
              tourId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              quantityBasis: basis,
              note: null,
            })
          }
        >
          <label className={pageStyles.field}>
            <span>Cơ sở tính</span>
            <select value={basis} onChange={(e) => setBasis(e.target.value)}>
              {Object.entries(QUANTITY_BASIS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </VariantPicker>
      )}
    </section>
  );
}

function PostsEditor({ tourId, initialPosts }) {
  const [posts, setPosts] = useState([...initialPosts].sort((a, b) => a.displayOrder - b.displayOrder));
  const [pick, setPick] = useState('');
  const { data: options = [] } = usePostOptions();
  const save = useSetTourPosts();
  const available = options.filter((option) => !posts.some((post) => post.postId === option.postId));

  const addPost = () => {
    const post = options.find((option) => option.postId === pick);
    if (post) setPosts((current) => [...current, post]);
    setPick('');
  };

  return (
    <>
      {posts.length === 0 && <p className={styles.hint}>Chưa gắn bài viết.</p>}
      <ol className={styles.list}>
        {posts.map((post, index) => (
          <li key={post.postId} className={formStyles.row}>
            <span style={{ flex: 1 }}>
              {post.title} <span className={styles.muted}>· {post.postType} · {post.status}</span>
            </span>
            <button type="button" className="btn btn-outline" aria-label="Lên" disabled={index === 0} onClick={() => setPosts((c) => move(c, index, -1))}>
              ↑
            </button>
            <button type="button" className="btn btn-outline" aria-label="Xuống" disabled={index === posts.length - 1} onClick={() => setPosts((c) => move(c, index, 1))}>
              ↓
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setPosts((c) => c.filter((p) => p.postId !== post.postId))}>
              Bỏ
            </button>
          </li>
        ))}
      </ol>
      <div className={formStyles.row}>
        <label className={pageStyles.field}>
          <span>Gắn bài viết</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Chọn bài viết</option>
            {available.map((option) => (
              <option key={option.postId} value={option.postId}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-outline" disabled={!pick} onClick={addPost}>
          Thêm
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={save.isPending}
          onClick={() => save.mutate({ tourId, items: posts.map((post, index) => ({ postId: post.postId, displayOrder: index })) })}
        >
          {save.isPending ? 'Đang lưu…' : 'Lưu bài viết'}
        </button>
      </div>
    </>
  );
}

function PostsPanel({ tourId }) {
  const query = useTourPosts(tourId);
  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Bài viết liên quan</h2>
      <QueryState query={query}>
        {(posts) => <PostsEditor key={query.dataUpdatedAt} tourId={tourId} initialPosts={posts} />}
      </QueryState>
    </section>
  );
}

function VersionsPanel({ tourId }) {
  const navigate = useNavigate();
  const query = useTourVersions(tourId);
  const [compareId, setCompareId] = useState('');
  const diff = useTourVersionDiff(tourId, compareId);
  const clone = useCloneTourVersion();

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>Phiên bản</h2>
      <QueryState query={query}>
        {(versions) => (
          <ul className={styles.list}>
            {versions.map((v) => (
              <li key={v.tourId} className={styles.tripRow}>
                {v.tourId === tourId ? (
                  <strong>v{v.version} (đang sửa)</strong>
                ) : (
                  <Link to={ROUTES.ADMIN_TOUR_EDIT(v.tourId)} className={styles.inlineLink}>
                    v{v.version} →
                  </Link>
                )}
                <span className={styles.muted}>
                  <AdminCatalogStatusBadge status={normalizeTourStatus(v.status)} /> · {v.tripsCount} chuyến ({v.upcomingTripsCount} sắp tới)
                  {v.itineraryLockedAt && ' · đã khóa'}
                </span>
                {v.tourId !== tourId && (
                  <button type="button" className="btn btn-outline" onClick={() => setCompareId(v.tourId)}>
                    So sánh
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </QueryState>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={clone.isPending}
        onClick={() => clone.mutate(tourId, { onSuccess: (res) => navigate(ROUTES.ADMIN_TOUR_EDIT(res.data)) })}
      >
        {clone.isPending ? 'Đang tạo…' : 'Tạo phiên bản mới'}
      </button>

      {compareId && (
        <QueryState query={diff}>
          {(result) => (
            <>
              <h3>
                So sánh v{result.baseVersion} với v{result.targetVersion}
              </h3>
              {result.changes.length === 0 ? (
                <p className={styles.hint}>Không có khác biệt.</p>
              ) : (
                <table className={formStyles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Phần</th>
                      <th scope="col">Thay đổi</th>
                      <th scope="col">Mục</th>
                      <th scope="col">Trước</th>
                      <th scope="col">Sau</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.changes.map((change, index) => (
                      <tr key={index}>
                        <td>{change.section}</td>
                        <td>{change.change}</td>
                        <td>{change.key}</td>
                        <td>{change.before ?? '—'}</td>
                        <td>{change.after ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </QueryState>
      )}
    </section>
  );
}

function TourEditor({ tourId }) {
  const query = useTourForEdit(tourId);
  return (
    <QueryState query={query}>
      {(tour) => (
        <div className={styles.layout}>
          <div className={styles.main}>
            <InfoPanel key={`${tour.tourId}-${query.dataUpdatedAt}`} tour={tour} />
            <ImagesPanel tourId={tourId} />
            <ActivitiesPanel tourId={tourId} locked={tour.isItineraryLocked} />
            <div className={styles.twoCols}>
              <PreparationPanel tourId={tourId} />
              <PostsPanel tourId={tourId} />
            </div>
            <ProvidedPanel tourId={tourId} locked={tour.isItineraryLocked} />
          </div>
          <aside className={styles.side}>
            <StatusPanel tour={tour} />
            <VersionsPanel tourId={tourId} />
            <p className={styles.hint}>Giá cơ sở hiện tại: {formatCurrency(tour.basePrice)}/người</p>
          </aside>
        </div>
      )}
    </QueryState>
  );
}

/** Soạn tour: tạo mới (/admin/tours/new) hoặc sửa toàn bộ (/admin/tours/:tourId/edit). BE chỉ cho Admin ghi. */
export default function AdminTourEditorPage() {
  const { tourId } = useParams();
  const { data: tour } = useTourForEdit(tourId);

  return (
    <section className={styles.page} aria-labelledby="admin-tour-editor-title">
      <header>
        <p className={styles.eyebrow}>
          <Link to={ROUTES.ADMIN_TOURS}>Tour</Link> / {tourId ? 'Soạn tour' : 'Tạo tour'}
        </p>
        <h1 id="admin-tour-editor-title" className={styles.title}>
          {tourId ? (tour?.name ?? 'Soạn tour') : 'Tạo tour mới'}
        </h1>
      </header>
      {tourId ? <TourEditor key={tourId} tourId={tourId} /> : <InfoPanel />}
    </section>
  );
}
