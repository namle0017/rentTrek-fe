import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE, USER_ROLE_LABEL } from '@/constants/enums';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { opsNavigation } from '@/features/operations/constants/opsNavigation';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const alerts = useOperations(API_ENDPOINTS.ADMIN.DASHBOARD.ALERTS);
  const handleSearch = (event) => { event.preventDefault(); if (search.trim()) navigate(ROUTES.ADMIN_ORDERS + '?search=' + encodeURIComponent(search.trim())); };
  return <div className={styles.layout}>
    <aside className={styles.sidebar + (isMenuOpen ? ' ' + styles.open : '')}>
      <Link to={ROUTES.ADMIN} className={styles.logo}>RenTrekk<span>.</span><small>VẬN HÀNH</small></Link>
      <div className={styles.navLabel}>KHÔNG GIAN LÀM VIỆC</div>
      <nav className={styles.nav} aria-label="Điều hướng vận hành">{opsNavigation.filter((item) => !item.adminOnly || currentUser?.role === USER_ROLE.ADMIN).map((item) => <NavLink to={item.to} key={item.to} end={item.to === ROUTES.ADMIN} onClick={() => setIsMenuOpen(false)}><span aria-hidden="true">{item.icon}</span>{item.label}</NavLink>)}</nav>
      <Link className={styles.back} to={ROUTES.HOME}>← Về trang khách hàng</Link>
    </aside>
    <div className={styles.content}>
      <header className={styles.header}>
        <button className={styles.menuButton} aria-label="Mở menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</button>
        <form className={styles.search} onSubmit={handleSearch}><span aria-hidden="true">⌕</span><input type="search" aria-label="Tìm mã đơn hoặc email khách" placeholder="Tìm mã đơn, email khách hàng…" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="submit">Tìm</button></form>
        <div className={styles.alertWrap}><button className={styles.bell} aria-label={'Cảnh báo vận hành: ' + (alerts.data?.length ?? 0)} aria-expanded={showAlerts} onClick={() => setShowAlerts(!showAlerts)}>♧{alerts.data?.length > 0 && <span>{alerts.data.length}</span>}</button>{showAlerts && <div className={styles.alertPanel}><strong>Cảnh báo vận hành</strong>{alerts.isError ? <p>Không tải được cảnh báo</p> : alerts.isPending ? <p>Đang tải…</p> : !alerts.data.length ? <p>Chưa có cảnh báo</p> : alerts.data.slice(0, 6).map((alert, index) => <Link key={index} to={alert.actionUrl} onClick={() => setShowAlerts(false)}>{alert.title}</Link>)}</div>}</div>
        <Link to={ROUTES.PROFILE} className={styles.user}><span className={styles.avatar}>{currentUser?.fullName?.slice(0, 1)}</span><div><strong>{currentUser?.fullName}</strong><small>{USER_ROLE_LABEL[currentUser?.role]}</small></div></Link>
      </header>
      <main className={styles.main}><Outlet /></main>
      <footer className={styles.footer}>RenTrekk · Mỗi chuyến đi, một hành trình đáng nhớ.</footer>
    </div>
  </div>;
}
