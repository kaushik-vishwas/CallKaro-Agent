import {Link} from 'react-router-dom';
import {Badge, Button, Card} from '../../ui';
import {levelTone, type PendingApproval} from '../../../data/mockDashboard';
import styles from './PendingApprovals.module.css';

type PendingApprovalsProps = {
  items: PendingApproval[];
  onReview?: (id: string) => void;
};

export function PendingApprovals({items, onReview}: PendingApprovalsProps) {
  return (
    <Card className={styles.panel} padding="none">
      <div className={styles.header}>
        <h2 className={styles.title}>Pending Approvals</h2>
        <Link to="/pending-approvals" className={styles.viewAll}>
          View All
        </Link>
      </div>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.id} className={styles.item}>
            <div className={styles.meta}>
              <div className={styles.top}>
                <p className={styles.name}>{item.name}</p>
                <Badge tone={levelTone(item.level)}>Level {item.level}</Badge>
              </div>
              <p className={styles.details}>
                {item.photos} photos · KYC: {item.kyc}
              </p>
              <p className={styles.time}>{item.timeAgo}</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onReview?.(item.id)}
            >
              Review
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
