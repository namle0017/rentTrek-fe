import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import ResourcePage from '@/features/operations/components/ResourcePage';
import StatusBadge from '@/features/operations/components/StatusBadge';
import { options } from '@/features/operations/constants/opsOptions';
import { formatDateTime } from '@/utils/formatDate';
const columns=[
 {key:'title',label:'Tiêu đề',sortable:true,render:(row)=><><Link to={ROUTES.ADMIN_POST(row.postId)}>{row.title}</Link><small>/{row.slug}</small></>},
 {key:'postType',label:'Loại bài',render:(row)=><StatusBadge value={row.postType}/>},
 {key:'authorFullName',label:'Tác giả'},
 {key:'status',label:'Trạng thái',render:(row)=><StatusBadge value={row.status}/>},
 {key:'publishedAt',label:'Ngày xuất bản',sortable:true,render:(row)=>formatDateTime(row.publishedAt)||'Chưa xuất bản'},
 {key:'linkedToursCount',label:'Tour gắn'}, {key:'readCount',label:'Lượt đọc'},
];
export default function PostsPage(){return <ResourcePage title="Bài viết & cẩm nang" subtitle="Kiến thức chuẩn bị cho mỗi hành trình." endpoint={API_ENDPOINTS.ADMIN.POSTS} columns={columns} rowKey={(row)=>row.postId} filters={[{name:'status',label:'Trạng thái',options:options('Draft','Published','Archived')},{name:'postType',label:'Loại bài',options:options('Guide','Skill','Location','News')}]}><Link className="btn" to={ROUTES.ADMIN_POST('new')}>＋ Viết bài mới</Link></ResourcePage>;}
