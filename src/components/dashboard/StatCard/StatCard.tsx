import {Users, Clock3, CircleCheck, Zap, DollarSign, type LucideIcon} from 'lucide-react';
import {Card} from '../../ui';
import type {DashboardStat, StatTone} from '../../../data/mockDashboard';
import styles from './StatCard.module.css';

const ICONS: Record<DashboardStat['icon'], LucideIcon> = {
  users: Users,
  clock: Clock3,
  check: CircleCheck,
  zap: Zap,
  dollar: DollarSign,
};

type StatCardProps = {
  stat: DashboardStat;
};

export function StatCard({stat}: StatCardProps) {
  const Icon = ICONS[stat.icon];
  return (
    <Card className={styles.card} padding="md">
      <div className={[styles.iconWrap, styles[stat.tone as StatTone]].join(' ')}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <p className={styles.value}>{stat.value}</p>
      <p className={styles.label}>{stat.label}</p>
    </Card>
  );
}
