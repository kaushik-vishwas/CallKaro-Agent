import {Link} from 'react-router-dom';
import {Plus, Link2, Eye, type LucideIcon} from 'lucide-react';
import type {QuickAction} from '../../../data/mockDashboard';
import styles from './ActionCard.module.css';

const ICONS: Record<QuickAction['icon'], LucideIcon> = {
  plus: Plus,
  link: Link2,
  eye: Eye,
};

type ActionCardProps = {
  action: QuickAction;
};

export function ActionCard({action}: ActionCardProps) {
  const Icon = ICONS[action.icon];
  return (
    <Link
      to={action.path}
      className={[
        styles.card,
        action.variant === 'primary' ? styles.primary : styles.outline,
      ].join(' ')}
    >
      <span className={styles.icon}>
        <Icon size={20} strokeWidth={2.25} />
      </span>
      <span className={styles.copy}>
        <span className={styles.title}>{action.title}</span>
        <span className={styles.description}>{action.description}</span>
      </span>
    </Link>
  );
}
