import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import ResourcePage from '@/features/operations/components/ResourcePage';
import StatusBadge from '@/features/operations/components/StatusBadge';
import { options } from '@/features/operations/constants/opsOptions';
import { formatDateTime } from '@/utils/formatDate';
import { orderStatusOptions, paymentStatusOptions } from '@/features/operations/constants/opsOptions';
import { formatCurrency } from '@/utils/formatCurrency';
const columns = [
 {key:'orderCode',label:'Mã đơn',sortable:true,render:(row)=><><Link to={ROUTES.ADMIN_ORDER(row.orderCode)}>{row.orderCode}</Link><small>{row.serviceSummary}</small></>},
 {key:'customer',label:'Khách hàng',render:(row)=><>{row.customer.fullName}<small>{row.customer.email}</small></>,exportValue:(row)=>row.customer.email},
 {key:'orderType',label:'Loại đơn',render:(row)=><StatusBadge value={row.orderType}/>},
 {key:'totalAmount',label:'Tổng tiền',sortable:true,render:(row)=>formatCurrency(row.totalAmount)},
 {key:'status',label:'Trạng thái',render:(row)=><StatusBadge value={row.status}/>},
 {key:'paymentStatus',label:'Thanh toán',render:(row)=><StatusBadge value={row.paymentStatus}/>},
 {key:'holdExpiresAt',label:'Hạn giữ chỗ',sortable:true,render:(row)=>formatDateTime(row.holdExpiresAt)||'—'},
 {key:'reconciliationDeadlineAt',label:'Hạn đối soát',sortable:true,render:(row)=>formatDateTime(row.reconciliationDeadlineAt)||'—'},
];
export default function OrdersPage(){return <ResourcePage title="Đơn hàng tổng hợp" subtitle="Theo dõi đơn tour và đơn thuê trong một không gian." endpoint={API_ENDPOINTS.ADMIN.ORDERS} columns={columns} rowKey={(row)=>row.orderId} filters={[{name:'tab',label:'Theo dõi nhanh',options:options('PendingPayment','NeedsReconciliation','PendingRefund','Cancelled')},{name:'orderType',label:'Loại đơn',options:options('Tour','Rental')},{name:'status',label:'Trạng thái',options:orderStatusOptions},{name:'paymentStatus',label:'Thanh toán',options:paymentStatusOptions}]} />;}
