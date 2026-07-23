import {PageHeader} from '../../components/layout/PageHeader/PageHeader';
import {StatCard} from '../../components/dashboard/StatCard/StatCard';
import {ActionCard} from '../../components/dashboard/ActionCard/ActionCard';
import {ActivityFeed} from '../../components/dashboard/ActivityFeed/ActivityFeed';
import {
  DASHBOARD_STATS,
  QUICK_ACTIONS,
  RECENT_ACTIVITY,
} from '../../data/mockDashboard';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Agent Dashboard"
        subtitle="Manage receiver onboarding and credentials"
      />

      <section className={styles.stats} aria-label="Key metrics">
        {DASHBOARD_STATS.map(stat => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </section>

      <section className={styles.actions} aria-label="Quick actions">
        {QUICK_ACTIONS.map(action => (
          <ActionCard key={action.id} action={action} />
        ))}
      </section>

      <section className={styles.split} aria-label="Recent activity">
        <ActivityFeed items={RECENT_ACTIVITY} />
      </section>
    </div>
  );
}
