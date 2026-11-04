import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import ResourcePage from '@/features/operations/components/ResourcePage';
import StatusBadge from '@/features/operations/components/StatusBadge';
import { options } from '@/features/operations/constants/opsOptions';
import { formatDateTime } from '@/utils/formatDate';
import { useState } from 'react';
import OperationDialog from '@/features/operations/components/OperationDialog';
import styles from '@/features/operations/components/Operations.module.css';
import { formatCurrency } from '@/utils/formatCurrency';
const columns=[
 {key:'orderCode',label:'Đơn thuê',render:(row)=><Link to={ROUTES.ADMIN_RENTAL(row.orderCode)}>{row.orderCode}</Link>},
 {key:'customer',label:'Khách hàng',render:(row)=><>{row.customer.fullName}<small>{row.customer.phone}</small></>,exportValue:(row)=>row.customer.fullName},
 {key:'rentalPeriod',label:'Thời gian thuê',render:(row)=><>{formatDateTime(row.rentalPeriod.startAt)}<small>→ {formatDateTime(row.rentalPeriod.endAt)}</small></>},
 {key:'issuedItemsCount',label:'Đã giao / tổng',render:(row)=>row.issuedItemsCount+' / '+row.totalItemsCount},
 {key:'returnedItemsCount',label:'Đã nhận / tổng',render:(row)=>row.returnedItemsCount+' / '+row.totalItemsCount},
 {key:'totalAmount',label:'Tổng tiền',render:(row)=>formatCurrency(row.totalAmount)},
 {key:'handlerFullName',label:'Người phụ trách'},
 {key:'status',label:'Trạng thái',render:(row)=><><StatusBadge value={row.status}/>{row.isOverdue&&<small>Quá hạn trả</small>}</>},
];
export default function RentalsPage(){const [selected,setSelected]=useState(null);return <><ResourcePage title="Đơn thuê thiết bị" subtitle="Tiếp nhận, theo dõi tiến độ giao và nhận lại thiết bị." endpoint={API_ENDPOINTS.ADMIN.RENTALS} columns={columns} rowKey={(row)=>row.orderId} filters={[{name:'tab',label:'Theo dõi nhanh',options:options('PickupToday','ReturnToday','Overdue','InFulfillment')},{name:'handledByUserId',label:'Phụ trách',options:[{value:'unassigned',label:'Chưa có người phụ trách'}]}]} actions={(row)=>!row.handlerFullName&&<button className={styles.secondary} onClick={()=>setSelected(row)}>Nhận xử lý</button>}/>{selected&&<OperationDialog title={'Nhận xử lý '+selected.orderCode} endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.RENTALS,selected.orderCode,'claim')} fields={[]} submitLabel="Xác nhận nhận đơn" onClose={()=>setSelected(null)}/>}</>;}
