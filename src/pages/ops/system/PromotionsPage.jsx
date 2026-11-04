import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import ResourcePage from '@/features/operations/components/ResourcePage';
import StatusBadge from '@/features/operations/components/StatusBadge';
import { options } from '@/features/operations/constants/opsOptions';
import { formatDateTime } from '@/utils/formatDate';
import { promotionFields } from '@/features/operations/constants/promotionFields';
const columns=[
 {key:'name',label:'Chương trình',sortable:true,render:(row)=><><Link to={ROUTES.ADMIN_PROMOTION(row.promotionId)}>{row.name}</Link><small>{row.promotionCode??'Tự động áp dụng'}</small></>},
 {key:'appliesTo',label:'Áp dụng cho',render:(row)=><StatusBadge value={row.appliesTo}/>},
 {key:'startAt',label:'Bắt đầu',sortable:true,render:(row)=>formatDateTime(row.startAt)},
 {key:'endAt',label:'Kết thúc',sortable:true,render:(row)=>formatDateTime(row.endAt)},
 {key:'usedCount',label:'Đã dùng / giới hạn',render:(row)=>row.usedCount+' / '+(row.maxUses??'∞')},
 {key:'status',label:'Trạng thái',render:(row)=><StatusBadge value={row.status}/>},
];
export default function PromotionsPage(){return <ResourcePage title="Chương trình khuyến mãi" subtitle="Quản lý ưu đãi, các bậc điều kiện và lịch sử sử dụng." endpoint={API_ENDPOINTS.ADMIN.PROMOTIONS} fields={promotionFields} createLabel="Tạo khuyến mãi" columns={columns} rowKey={(row)=>row.promotionId} filters={[{name:'status',label:'Trạng thái',options:options('Draft','Active','Paused','Expired')},{name:'appliesTo',label:'Áp dụng',options:options('Tour','Rental','All')}]} />;}
