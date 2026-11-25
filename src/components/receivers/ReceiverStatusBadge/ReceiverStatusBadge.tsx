import type {ReceiverStage, ReceiverStatus} from '../../../data/mockReceivers';
import styles from './ReceiverStatusBadge.module.css';

// Same labels as the admin panel's ReceiverStatusBadge.
const STAGE_LABELS: Record<ReceiverStage, string> = {
  draft: 'Draft',
  pending: 'Pending',
  active: 'Approved',
  suspended: 'Suspended',
  blocked: 'Suspended',
  rejected: 'Rejected',
};

// Fallback when the backend only sends the simplified status.
const SIMPLE_TO_STAGE: Record<ReceiverStatus, ReceiverStage> = {
  Active: 'active',
  'Pending Review': 'pending',
  Inactive: 'suspended',
};

export function ReceiverStatusBadge({
  status,
  stage,
}: {
  status: ReceiverStatus;
  stage?: ReceiverStage | null;
}) {
  const resolved: ReceiverStage =
    stage && stage in STAGE_LABELS ? stage : SIMPLE_TO_STAGE[status] ?? 'pending';

  return (
    <span className={[styles.badge, styles[resolved]].join(' ')}>
      {STAGE_LABELS[resolved]}
    </span>
  );
}
