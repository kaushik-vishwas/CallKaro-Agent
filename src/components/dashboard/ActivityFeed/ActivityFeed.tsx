import {Avatar, Badge, Card} from '../../ui';
import {levelTone, type ActivityItem} from '../../../data/mockDashboard';
import styles from './ActivityFeed.module.css';

type ActivityFeedProps = {
  items: ActivityItem[];
};

export function ActivityFeed({items}: ActivityFeedProps) {
  return (
    <Card className={styles.panel} padding="none">
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Activity</h2>
      </div>
      <ul className={styles.list}>
        {items.map(item => (
          <li key={item.id} className={styles.item}>
            <Avatar name={item.name} size="md" />
            <div className={styles.content}>
              <div className={styles.top}>
                <p className={styles.name}>{item.name}</p>
                <Badge tone={levelTone(item.level)}>Level {item.level}</Badge>
              </div>
              <p className={styles.action}>{item.action}</p>
            </div>
            <span className={styles.time}>{item.timeAgo}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
