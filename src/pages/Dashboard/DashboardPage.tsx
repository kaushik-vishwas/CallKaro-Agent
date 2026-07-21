import {useCallback, useState} from 'react';
import {PageHeader} from '../../components/layout/PageHeader/PageHeader';
import {StatCard} from '../../components/dashboard/StatCard/StatCard';
import {ActionCard} from '../../components/dashboard/ActionCard/ActionCard';
import {ActivityFeed} from '../../components/dashboard/ActivityFeed/ActivityFeed';
import {PendingApprovals} from '../../components/dashboard/PendingApprovals/PendingApprovals';
import {Button, Modal} from '../../components/ui';
import {
  DASHBOARD_STATS,
  PENDING_APPROVALS,
  QUICK_ACTIONS,
  RECENT_ACTIVITY,
} from '../../data/mockDashboard';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const [reviewId, setReviewId] = useState<string | null>(null);

  const selected = PENDING_APPROVALS.find(item => item.id === reviewId) ?? null;

  const closeModal = useCallback(() => setReviewId(null), []);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Agent Dashboard"
        subtitle="Manage receiver onboarding and approvals"
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

      <section className={styles.split} aria-label="Activity and approvals">
        <ActivityFeed items={RECENT_ACTIVITY} />
        <PendingApprovals items={PENDING_APPROVALS} onReview={setReviewId} />
      </section>

      <Modal
        open={Boolean(selected)}
        title={selected ? `Review ${selected.name}` : 'Review'}
        onClose={closeModal}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={closeModal}>
              Approve Profile
            </Button>
          </>
        }
      >
        {selected ? (
          <div className={styles.modalBody}>
            <p>
              <strong>{selected.name}</strong> submitted a Level {selected.level}{' '}
              profile for review.
            </p>
            <p>
              Photos: {selected.photos} · KYC: {selected.kyc} · Submitted{' '}
              {selected.timeAgo}
            </p>
            <p className={styles.modalHint}>
              Wire this modal to your backend review API when ready.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
