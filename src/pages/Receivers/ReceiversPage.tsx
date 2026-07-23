import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Filter, MoreVertical, Plus, Search} from 'lucide-react';
import {Avatar, Badge, Button, Card, Table, type TableColumn} from '../../components/ui';
import {
  fetchReceiverStats,
  listReceivers,
} from '../../api/agent';
import {ApiError} from '../../api/client';
import {
  formatInr,
  levelTone,
  statusTone,
  type ReceiverListItem,
  type ReceiverStatus,
} from '../../data/mockReceivers';
import styles from './ReceiversPage.module.css';

type StatusFilter = 'All' | 'Active' | 'Inactive';

export function ReceiversPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
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
          listReceivers({
            status: statusFilter === 'All' ? undefined : statusFilter,
          }),
          fetchReceiverStats(),
        ]);
        if (cancelled) return;
        setRows(listRes.receivers);
        setStats(statsRes.stats);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load receivers.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter(
      row =>
        row.name.toLowerCase().includes(normalized) ||
        row.id.toLowerCase().includes(normalized),
    );
  }, [query, rows]);

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
      render: row => (
        <Badge tone={statusTone(row.status as ReceiverStatus)}>{row.status}</Badge>
      ),
    },
    {
      key: 'hours',
      header: 'Total Hours',
      render: row => <span className={styles.metric}>{row.totalHours}</span>,
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
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Receivers</h1>
          <p className={styles.subtitle}>Manage all receiver profiles</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate('/add-receiver')}
        >
          Create Receiver
        </Button>
      </div>

      <section className={styles.stats} aria-label="Receiver summary">
        {stats.map(stat => (
          <Card key={stat.id} className={styles.statCard} padding="md">
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </Card>
        ))}
      </section>

      <Card className={styles.tableCard} padding="none">
        <div className={styles.toolbar}>
          <label className={styles.search} htmlFor="receiver-search">
            <Search size={16} className={styles.searchIcon} />
            <input
              id="receiver-search"
              type="search"
              placeholder="Search receivers..."
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <label className={styles.filter} htmlFor="status-filter">
            <Filter size={16} />
            <select
              id="status-filter"
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
          rows={filteredRows}
          rowKey={row => row.id}
          emptyMessage={
            loading ? 'Loading receivers…' : 'No receivers match your filters.'
          }
        />
      </Card>
    </div>
  );
}
