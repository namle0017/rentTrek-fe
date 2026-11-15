import BackofficeShell from './BackofficeShell';
import { STAFF_NAV } from './navigation';

/** Layout riêng cho Staff (nhân viên vận hành / kho): menu tập trung vào kho, đơn thuê và chuyến đi. */
export default function StaffLayout() {
  return <BackofficeShell nav={STAFF_NAV} fallbackName="Nhân viên vận hành" />;
}
