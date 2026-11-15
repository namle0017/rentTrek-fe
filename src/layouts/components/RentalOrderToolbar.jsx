import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import styles from './RentalOrderToolbar.module.css';

const steps = [
  { key: 'handover', label: 'Giao thiết bị', route: ROUTES.OPS_HANDOVER },
  { key: 'return', label: 'Nhận lại thiết bị', route: ROUTES.OPS_RETURN },
  { key: 'settlement', label: 'Quyết toán & Phí', route: ROUTES.OPS_SETTLEMENT },
];

export default function RentalOrderToolbar({ orderCode, step }) {
  const [draftCode, setDraftCode] = useState(orderCode);
  const navigate = useNavigate();
  const activeStep = steps.find((item) => item.key === step) || steps[0];

  const handleSubmit = (event) => {
    event.preventDefault();
    const code = draftCode.trim();
    if (code) navigate(activeStep.route(encodeURIComponent(code)));
  };

  return (
    <section className={styles.toolbar} aria-label="Tra cứu đơn thuê">
      <form onSubmit={handleSubmit} className={styles.lookup}>
        <label className={styles.field} htmlFor="rental-order-lookup">
          Mã đơn thuê
          <input
            id="rental-order-lookup"
            type="text"
            placeholder="Nhập mã đơn (vd: RT-202611-001)"
            value={draftCode}
            onChange={(event) => setDraftCode(event.target.value)}
            autoComplete="off"
          />
        </label>
        <button type="submit" disabled={!draftCode.trim()}>
          Tìm đơn
        </button>
      </form>
      {orderCode && (
        <nav className={styles.navigation} aria-label="Thao tác đơn thuê">
          {steps.map((item) => (
            <Link
              key={item.key}
              to={item.route(encodeURIComponent(orderCode))}
              aria-current={item.key === step ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </section>
  );
}
