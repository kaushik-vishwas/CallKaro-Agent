import {useEffect, useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {CalendarDays, Check, CircleDollarSign, Medal} from 'lucide-react';
import {Avatar, Badge, Button, Card} from '../../components/ui';
import {fetchReceiver} from '../../api/agent';
import {ApiError} from '../../api/client';
import type {ReceiverProfile} from '../../data/mockReceivers';
import styles from './ApprovalSuccessPage.module.css';

const NEXT_STEPS = [
  {
    title: 'Receiver Notification',
    body: 'The receiver receives an email confirmation that their profile is approved.',
  },
  {
    title: 'Profile Goes Live',
    body: 'Their profile becomes visible to customers and can start receiving calls.',
  },
  {
    title: 'Earnings Tracking',
    body: 'Call time and earnings are tracked automatically with payouts on schedule.',
  },
  {
    title: 'Ongoing Support',
    body: 'You can monitor performance and support them from your agent dashboard.',
  },
];

function rateForLevel(level: number): string {
  if (level >= 3) return '₹20/min';
  if (level === 2) return '₹15/min';
  return '₹10/min';
}

export function ApprovalSuccessPage() {
  const {id = ''} = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activatedAt] = useState(() => new Date().toLocaleString('en-US'));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await fetchReceiver(id);
        if (cancelled) return;
        setProfile(data.receiver);
      } catch (err) {
        if (!cancelled) {
          setNotFound(err instanceof ApiError && err.statusCode === 404);
          setProfile(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p style={{color: '#6b7280', textAlign: 'center'}}>Loading…</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return <Navigate to="/pending-approvals" replace />;
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card} padding="lg">
        <div className={styles.hero}>
          <span className={styles.successIcon} aria-hidden>
            <Check size={32} strokeWidth={2.75} />
          </span>
          <h1 className={styles.title}>Receiver Approved Successfully!</h1>
          <p className={styles.subtitle}>
            {profile.name}&apos;s profile has been approved and activated. They
            can now start receiving calls on Callkaro.
          </p>
        </div>

        <div className={styles.summary}>
          <Avatar name={profile.name} size="lg" />
          <div className={styles.summaryMeta}>
            <p className={styles.summaryName}>{profile.name}</p>
            <p className={styles.summaryId}>{profile.id}</p>
          </div>
          <div className={styles.badges}>
            <div className={styles.metaChip}>
              <Medal size={14} />
              <span>
                Level <strong>Level {profile.level}</strong>
              </span>
            </div>
            <div className={styles.metaChip}>
              <CircleDollarSign size={14} />
              <span>
                Rate <strong>{rateForLevel(profile.level)}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.activation}>
          <h2 className={styles.sectionTitle}>Activation Details</h2>
          <div className={styles.activationRow}>
            <span className={styles.rowIconSuccess}>
              <Check size={16} strokeWidth={2.5} />
            </span>
            <div className={styles.rowCopy}>
              <p className={styles.rowLabel}>Receiver Status</p>
              <p className={styles.rowValue}>Active and ready for calls</p>
            </div>
            <Badge tone="success">Active</Badge>
          </div>
          <div className={styles.activationRow}>
            <span className={styles.rowIconPink}>
              <CalendarDays size={16} />
            </span>
            <div className={styles.rowCopy}>
              <p className={styles.rowLabel}>Activated At</p>
              <p className={styles.rowValue}>{activatedAt}</p>
            </div>
          </div>
        </div>

        <div className={styles.next}>
          <h2 className={styles.sectionTitle}>What Happens Next?</h2>
          <ol className={styles.nextList}>
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title} className={styles.nextItem}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <div>
                  <p className={styles.stepTitle}>{step.title}</p>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.footerActions}>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => navigate('/pending-approvals')}
          >
            Review More Profiles
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
