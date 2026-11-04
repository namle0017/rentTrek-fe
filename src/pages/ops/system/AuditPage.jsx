import { API_ENDPOINTS } from '@/api/endpoints';
import ResourcePage from '@/features/operations/components/ResourcePage';
import { options } from '@/features/operations/constants/opsOptions';
import { formatDateTime } from '@/utils/formatDate';
import styles from '@/features/operations/components/Operations.module.css';
const columns=[{key:'createdAt',label:'Thời điểm',sortable:true,render:(row)=>formatDateTime(row.createdAt)},{key:'actorFullName',label:'Người thực hiện'},{key:'action',label:'Hành động'},{key:'entityType',label:'Đối tượng'},{key:'details',label:'Thay đổi',render:(row)=><details><summary>Xem trước / sau</summary><pre className={styles.json}>{JSON.stringify(row.details,null,2)}</pre></details>,exportValue:(row)=>JSON.stringify(row.details)}];
export default function AuditPage(){return <ResourcePage title="Nhật ký kiểm toán" subtitle="Tra cứu thao tác và dữ liệu trước / sau khi thay đổi." endpoint={API_ENDPOINTS.ADMIN.AUDIT} columns={columns} rowKey={(row)=>row.auditLogId} filters={[{name:'action',label:'Hành động',options:options('Create','Update','Lock','Cancel','Approve','Void','Revoke','Hide','Unhide')},{name:'entityType',label:'Đối tượng',options:options('Order','Trip','Account','Review','Promotion','Post','SystemConfiguration')},{name:'fromDate',label:'Từ ngày',type:'datetime-local'},{name:'toDate',label:'Đến ngày',type:'datetime-local'}]} />;}
