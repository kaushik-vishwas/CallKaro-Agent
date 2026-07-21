import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Filter, Search} from 'lucide-react';
import {Avatar, Badge, Button, Card, Table, type TableColumn} from '../../components/ui';
import {fetchReceiverStats, listCredentialReceivers} from '../../api/agent';
import {ApiError} from '../../api/client';
import {
  statusTone,
  type ReceiverListItem,
  type ReceiverStatus,
} from '../../data/mockReceivers';
import styles from './ShareCredentialsPage.module.css';

type StatusFilter = 'All' | 'Active' | 'Inactive';

export function ShareCredentialsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [rows, setRows] = useState<ReceiverListItem[]>([]);
  const [stats, setStats] = useState<Array<{id: string; label: string; value: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [listRes, statsRes] = await Promise.all([
          listCredentialReceivers(),
          fetchReceiverStats(),
        ]);
        if (cancelled) return;
        setRows(listRes.receivers);
        setStats(statsRes.stats);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Failed to load credentials list.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter(row => {
      const matchesStatus =
        statusFilter === 'All' ? true : row.status === statusFilter;
      const matchesQuery =
        !normalized ||
        row.name.toLowerCase().includes(normalized) ||
        row.id.toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [query, rows, statusFilter]);

  const columns: TableColumn<ReceiverListItem>[] = [
    {
      key: 'receiver',
      header: 'Receiver',
      render: row => (
        <div className={styles.receiverCell}>
          <Avatar name={row.name} size="sm" />
          <span>
            <span className={styles.receiverName}>{row.name}</span>
            <span className={styles.receiverId}>{row.id}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: row => (
        <span className={styles.levelText}>Level {row.level}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: row => (
        <Badge tone={statusTone(row.status as ReceiverStatus)}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '170px',
      render: row => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate(`/share-credentials/${row.id}`)}
        >
          View Credentials
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Share Credentials</h1>
        <p className={styles.subtitle}>
          Share login credentials with approved receivers
        </p>
      </header>

      <section className={styles.stats} aria-label="Summary">
        {stats.slice(0, 4).map(stat => (
          <Card key={stat.id} className={styles.statCard} padding="md">
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </Card>
        ))}
      </section>

      <Card className={styles.tableCard} padding="none">
        <div className={styles.toolbar}>
          <label className={styles.search} htmlFor="cred-search">
            <Search size={16} className={styles.searchIcon} />
            <input
              id="cred-search"
              type="search"
              placeholder="Search receivers..."
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <label className={styles.filter} htmlFor="cred-status">
            <Filter size={16} />
            <select
              id="cred-status"
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value as StatusFilter)
              }
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>

        {error ? (
          <p style={{padding: 24, color: '#dc2626', margin: 0}}>{error}</p>
        ) : null}

        <Table
          columns={columns}
          rows={filtered}
          rowKey={row => row.id}
          emptyMessage={loading ? 'Loading…' : 'No receivers found.'}
        />
      </Card>
    </div>
  );
}
