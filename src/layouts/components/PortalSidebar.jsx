import { ArrowUpRight, ChevronDown, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import BrandLogo from '@/components/BrandLogo';
import { ROUTES } from '@/constants/routes';
import styles from './PortalSidebar.module.css';

const isWithin = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

/**
 * Sidebar dùng chung cho Admin, Staff và Guide: brand, link chính, caption, các nhóm thu gọn
 * và link "Về trang chủ". Dưới 768px thành drawer (mở bằng `open`, đóng bằng `onClose`).
 */
export default function PortalSidebar({ id, nav, open = false, onClose, ariaLabel = 'Menu chính', className = '' }) {
  const { pathname } = useLocation();
  const { brandSuffix, brandTo, overview, caption, groups = [] } = nav;
  const OverviewIcon = overview?.icon;

  return (
    <>
      {open && <button type="button" className={styles.backdrop} aria-label="Đóng menu" onClick={onClose} />}
      <aside id={id} className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''} ${className}`}>
        <div className={styles.brand}>
          <BrandLogo size="md" theme="light" suffix={brandSuffix} to={brandTo} />
          <button type="button" className={styles.closeMenu} aria-label="Đóng menu" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <nav
          className={styles.nav}
          aria-label={ariaLabel}
          onClick={(event) => {
            if (event.target.closest('a')) onClose?.();
          }}
        >
          {overview && (
            <NavLink className={styles.overviewLink} to={overview.to} end={overview.end}>
              {OverviewIcon && <OverviewIcon size={16} />}
              {overview.label}
            </NavLink>
          )}
          {caption && <span className={styles.navCaption}>{caption}</span>}
          {groups.map(({ title, icon: Icon, items, expanded }) => {
            const isCurrentGroup = items.some(([to]) => isWithin(pathname, to));
            return (
              <details className={styles.navGroup} key={title} open={isCurrentGroup || !!expanded}>
                <summary>
                  {Icon && <Icon size={16} />}
                  <span>{title}</span>
                  <ChevronDown size={13} className={styles.groupChevron} />
                </summary>
                <div className={styles.groupLinks}>
                  {items.map(([to, label, options]) => (
                    <NavLink key={to} to={to} end={options?.end}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              </details>
            );
          })}
        </nav>
        <Link className={styles.siteLink} to={ROUTES.HOME}>
          Về trang chủ <ArrowUpRight size={14} />
        </Link>
      </aside>
    </>
  );
}
