import {useState, type ReactNode} from 'react';
import {Menu, X} from 'lucide-react';
import {Sidebar} from '../Sidebar/Sidebar';
import styles from './AppLayout.module.css';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({children}: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen(value => !value)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <Sidebar open={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <main className={styles.main}>{children}</main>
    </div>
  );
}
