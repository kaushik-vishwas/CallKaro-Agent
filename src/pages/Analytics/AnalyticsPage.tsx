import {useCallback, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Activity,
  Clock3,
  MoreVertical,
  Phone,
  ShieldCheck,
  TimerReset,
  Users,
} from 'lucide-react';
import {PageHeader} from '../../components/layout/PageHeader/PageHeader';
import {Avatar, Badge, Card, Table, type TableColumn} from '../../components/ui';
import {fetchAgentAnalytics} from '../../api/agent';
import {ApiError} from '../../api/client';
import {
  formatHours,
  formatInr,
  levelTone,
  statusTone,
  type ReceiverListItem,
} from '../../data/mockReceivers';
import styles from './AnalyticsPage.module.css';

const STAT_ICONS: Record<string, typeof Users> = {
  total: Users,
  pending: Clock3,
  approved: ShieldCheck,
  active: Activity,
  calls: Phone,
  hours: TimerReset,
};

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [stats, setStats] = useState<
    Array<{id: string; label: string; value: string}>
  >([]);
  const [monthlyTrend, setMonthlyTrend] = useState<
    Array<{month: string; value: number}>
  >([]);
  const [topPerformers, setTopPerformers] = useState<ReceiverListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchAgentAnalytics();
      setStats(result.analytics.stats || []);
      setMonthlyTrend(result.analytics.monthlyTrend || []);
      setTopPerformers(result.analytics.topPerformers || []);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to load analytics.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxTrend = useMemo(
    () => Math.max(...monthlyTrend.map(item => item.value), 1),
    [monthlyTrend],
  );

  const columns: TableColumn<ReceiverListItem>[] = [
    {
      key: 'receiver',
      header: 'Receiver',
      render: row => (
        <button
          type="button"
          className={styles.receiverCell}
          onClick={() => navigate(`/receivers/${row.id}`)}
        >
          <Avatar name={row.name} size="sm" />
          <span>
            <span className={styles.receiverName}>{row.name}</span>
            <span className={styles.receiverId}>{row.id}</span>
          </span>
        </button>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: row => (
        <Badge tone={levelTone(row.level)}>Level {row.level}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => <Badge tone={statusTone(row.status)}>{row.status}</Badge>,
    },
    {
      key: 'hours',
      header: 'Total Hours',
      render: row => (
        <span className={styles.metric}>{formatHours(row.totalHours)}</span>
      ),
    },
    {
      key: 'earnings',
      header: 'Earnings',
      render: row => (
        <span className={styles.metric}>{formatInr(row.earnings)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '72px',
      render: row => (
        <div className={styles.actionsWrap}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={`Actions for ${row.name}`}
            onClick={event => {
              event.stopPropagation();
              setMenuOpenId(current => (current === row.id ? null : row.id));
            }}
          >
            <MoreVertical size={18} />
          </button>
          {menuOpenId === row.id ? (
            <div className={styles.menu} role="menu">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpenId(null);
                  navigate(`/receivers/${row.id}`);
                }}
              >
                View Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpenId(null);
                  navigate(`/share-credentials/${row.id}`);
                }}
              >
                Share Credentials
              </button>
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page} onClick={() => setMenuOpenId(null)}>
      <PageHeader
        title="Analytics"
        subtitle="Live performance of your receiver team"
      />

      {loading ? <p>Loading analytics…</p> : null}
      {error ? (
        <p style={{color: '#dc2626', marginBottom: 16}}>{error}</p>
      ) : null}

      <section className={styles.stats} aria-label="Analytics metrics">
        {stats.map(stat => {
          const Icon = STAT_ICONS[stat.id] || Users;
          return (
            <Card key={stat.id} className={styles.statCard} padding="md">
              <span className={styles.statIcon} aria-hidden>
                <Icon size={18} strokeWidth={2.25} />
              </span>
              <div>
                <p className={styles.statValue}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </section>

      <Card className={styles.chartCard} padding="lg">
        <h2 className={styles.sectionTitle}>Monthly Trend</h2>
        <div
          className={styles.chart}
          role="img"
          aria-label="Monthly trend bar chart"
        >
          {monthlyTrend.length === 0 && !loading ? (
            <p style={{color: '#6b7280'}}>No trend data yet.</p>
          ) : null}
          {monthlyTrend.map((item, index) => {
            const height = Math.max(
              12,
              Math.round((item.value / maxTrend) * 100),
            );
            const emphasis = [3, 6, 9, 11].includes(index);
            return (
              <div key={`${item.month}-${index}`} className={styles.barGroup}>
                <div className={styles.barTrack}>
                  <div
                    className={[
                      styles.bar,
                      emphasis ? styles.barStrong : styles.barSoft,
                    ].join(' ')}
                    style={{height: `${height}%`}}
                    title={`${item.month}: ${item.value}`}
                  />
                </div>
                <span className={styles.barLabel}>{item.month}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <section className={styles.performers}>
        <h2 className={styles.sectionTitle}>Top Performers</h2>
        <Card className={styles.tableCard} padding="none">
          <Table
            columns={columns}
            rows={topPerformers}
            rowKey={row => row.id}
            emptyMessage="No performers yet."
          />
        </Card>
      </section>
    </div>
  );
}
