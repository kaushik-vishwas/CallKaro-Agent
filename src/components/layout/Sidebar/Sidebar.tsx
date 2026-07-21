import {NavLink} from 'react-router-dom';
import {Avatar} from '../../ui';
import {useAuth} from '../../../auth/AuthContext';
import {NAV_ITEMS} from '../../../data/nav';
import styles from './Sidebar.module.css';

type SidebarProps = {
  open: boolean;
  onNavigate?: () => void;
};

export function Sidebar({open, onNavigate}: SidebarProps) {
  const {agent} = useAuth();
  const name = agent?.name || 'Agent';
  const email = agent?.email || '';

  return (
    <aside className={[styles.sidebar, open ? styles.open : ''].join(' ')}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>C</span>
        <span className={styles.brandText}>Callkaro Agent</span>
      </div>

      <nav className={styles.nav} aria-label="Main">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({isActive}) =>
                [styles.navItem, isActive ? styles.active : '']
                  .filter(Boolean)
                  .join(' ')
              }
              onClick={onNavigate}
            >
              <Icon size={18} strokeWidth={2} className={styles.navIcon} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.user}>
        <Avatar name={name} src={agent?.avatarUrl || undefined} size="md" />
        <div className={styles.userMeta}>
          <p className={styles.userName}>{name}</p>
          <p className={styles.userEmail}>{email}</p>
        </div>
      </div>
    </aside>
  );
}
