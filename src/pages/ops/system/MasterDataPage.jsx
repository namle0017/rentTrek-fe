import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import ResourcePage from '@/features/operations/components/ResourcePage';
import OperationDialog from '@/features/operations/components/OperationDialog';
import { options } from '@/features/operations/constants/opsOptions';
import StatusBadge from '@/features/operations/components/StatusBadge';
import styles from '@/features/operations/components/Operations.module.css';

const resources = {
  categories: { title: 'Danh mục', endpoint: API_ENDPOINTS.ADMIN.CATEGORIES, id: 'categoryId', fields: [{ name: 'name', label: 'Tên danh mục', required: true, maxLength: 100 }, { name: 'categoryType', label: 'Loại danh mục', type: 'select', options: options('Tour', 'Equipment', 'Bundle'), required: true }, { name: 'description', label: 'Mô tả', type: 'textarea' }, { name: 'isActive', label: 'Đang hoạt động', type: 'checkbox', defaultValue: true }], columns: [{ key: 'name', label: 'Danh mục' }, { key: 'categoryType', label: 'Loại', render: (row) => <StatusBadge value={row.categoryType} /> }, { key: 'description', label: 'Mô tả' }, { key: 'isActive', label: 'Trạng thái', render: (row) => <StatusBadge value={row.isActive ? 'Active' : 'Inactive'} /> }] },
  locations: { title: 'Địa điểm', endpoint: API_ENDPOINTS.ADMIN.LOCATIONS, id: 'locationId', fields: [{ name: 'name', label: 'Tên địa điểm', required: true, maxLength: 200 }, { name: 'address', label: 'Địa chỉ', required: true, maxLength: 500 }, { name: 'latitude', label: 'Vĩ độ', type: 'number', min: -90, max: 90, required: true }, { name: 'longitude', label: 'Kinh độ', type: 'number', min: -180, max: 180, required: true }], columns: [{ key: 'name', label: 'Địa điểm' }, { key: 'address', label: 'Địa chỉ' }, { key: 'latitude', label: 'Tọa độ & bản đồ', render: (row) => <a href={`https://www.openstreetmap.org/?mlat=${row.latitude}&mlon=${row.longitude}#map=13/${row.latitude}/${row.longitude}`} target="_blank" rel="noreferrer">{row.latitude}, {row.longitude} ↗</a> }, { key: 'toursCount', label: 'Tour sử dụng' }] },
  tags: { title: 'Tags bài viết', endpoint: API_ENDPOINTS.ADMIN.TAGS, id: 'tagId', fields: [{ name: 'name', label: 'Tên tag', required: true, maxLength: 100 }, { name: 'slug', label: 'Slug', required: true, maxLength: 200 }], columns: [{ key: 'name', label: 'Tên tag' }, { key: 'slug', label: 'Slug' }, { key: 'postsCount', label: 'Bài viết' }] },
  skills: { title: 'Kỹ năng mềm', endpoint: API_ENDPOINTS.ADMIN.SOFT_SKILLS, id: 'softSkillId', fields: [{ name: 'name', label: 'Tên kỹ năng', required: true, maxLength: 100 }, { name: 'description', label: 'Mô tả', type: 'textarea' }], columns: [{ key: 'name', label: 'Kỹ năng' }, { key: 'description', label: 'Mô tả' }] },
};

export default function MasterDataPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = Object.hasOwn(resources, searchParams.get('section')) ? searchParams.get('section') : 'categories';
  const [dialog, setDialog] = useState(null);
  const { currentUser } = useAuth();
  const resource = resources[tab];
  return <div className={styles.page}>
    <nav className={styles.tabs} role="tablist" aria-label="Master data">{Object.entries(resources).map(([key, item]) => <button key={key} role="tab" aria-selected={key === tab} onClick={() => setSearchParams({ section: key })}>{item.title}</button>)}</nav>
    <ResourcePage key={tab} title={resource.title} subtitle="Dữ liệu dùng chung cho tour, thiết bị và cẩm nang." endpoint={resource.endpoint} columns={resource.columns} rowKey={(row) => row[resource.id]} fields={resource.fields} createLabel={`Thêm ${resource.title.toLowerCase()}`} actions={currentUser?.role === USER_ROLE.ADMIN ? (row) => <><button className={styles.secondary} onClick={() => setDialog({ row, method: 'put' })}>Chỉnh sửa</button><button className={styles.danger} onClick={() => setDialog({ row, method: 'delete' })}>Ẩn</button></> : undefined} />
    {dialog && <OperationDialog title={dialog.method === 'delete' ? 'Xác nhận ẩn dữ liệu' : `Sửa ${resource.title.toLowerCase()}`} endpoint={API_ENDPOINTS.ADMIN.DETAIL(resource.endpoint, dialog.row[resource.id])} method={dialog.method} fields={dialog.method === 'delete' ? [] : resource.fields.filter((field) => field.name !== 'categoryType')} values={dialog.row} onClose={() => setDialog(null)} />}
  </div>;
}
