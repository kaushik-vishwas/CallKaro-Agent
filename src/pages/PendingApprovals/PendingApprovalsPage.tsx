import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Eye, Filter, Search} from 'lucide-react';
import {Avatar, Button, Card, Table, type TableColumn} from '../../components/ui';
import {listPendingApprovals} from '../../api/agent';
import {ApiError} from '../../api/client';
import type {PendingApprovalRow} from '../../data/mockReceivers';
import styles from './PendingApprovalsPage.module.css';

export function PendingApprovalsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [pending, setPending] = useState<PendingApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listPendingApprovals();
        if (!cancelled) setPending(data.pending);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Failed to load pending approvals.',
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

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = pending.filter(
      row =>
        !normalized ||
        row.name.toLowerCase().includes(normalized) ||
        row.id.toLowerCase().includes(normalized),
    );

    const order = [...filtered];
    if (sort === 'oldest') {
      order.reverse();
    }
    return order;
  }, [pending, query, sort]);

  const columns: TableColumn<PendingApprovalRow>[] = [
    {
      key: 'receiver',
      header: 'Receiver',
      render: row => (
        <div className={styles.receiverCell}>
          <Avatar name={row.name} size="sm" />
          <span>
            <span className={styles.receiverName}>{row.name}</span>
            <span className={styles.receiverId}>ID: {row.id}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'photos',
      header: 'Photos',
      render: row => (
        <span className={styles.meta}>{row.photoCount} photos</span>
      ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: row => <span className={styles.meta}>{row.submittedAgo}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '140px',
      render: row => (
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Eye size={15} />}
          onClick={() => navigate(`/pending-approvals/${row.id}`)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pending Approvals</h1>
        <p className={styles.subtitle}>Review and approve receiver profiles</p>
      </header>

      <Card className={styles.tableCard} padding="none">
        <div className={styles.toolbar}>
          <label className={styles.search} htmlFor="pending-search">
            <Search size={16} />
            <input
              id="pending-search"
              type="search"
              placeholder="Search..."
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </label>
          <label className={styles.filter} htmlFor="pending-sort">
            <Filter size={16} />
            <select
              id="pending-sort"
              value={sort}
              onChange={event =>
                setSort(event.target.value as 'newest' | 'oldest')
              }
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>

        {error ? (
          <p style={{padding: 24, color: '#dc2626', margin: 0}}>{error}</p>
        ) : null}

        <Table
          columns={columns}
          rows={rows}
          rowKey={row => row.id}
          emptyMessage={
            loading ? 'Loading…' : 'No pending approvals right now.'
          }
        />
      </Card>
    </div>
  );
}
