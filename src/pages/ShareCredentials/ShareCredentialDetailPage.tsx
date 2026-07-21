import {useEffect, useState} from 'react';
import {Navigate, useNavigate, useParams} from 'react-router-dom';
import {Check, Copy, Share2} from 'lucide-react';
import {Badge, Button, Card} from '../../components/ui';
import {
  fetchReceiver,
  fetchReceiverCredentials,
} from '../../api/agent';
import {ApiError} from '../../api/client';
import {
  levelTone,
  type ReceiverCredentials,
  type ReceiverProfile,
} from '../../data/mockReceivers';
import styles from './ShareCredentialDetailPage.module.css';

type CopiedField = 'loginId' | 'temporaryPassword' | null;

export function ShareCredentialDetailPage() {
  const {id = ''} = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [credentials, setCredentials] = useState<ReceiverCredentials | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<CopiedField>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [profileRes, credRes] = await Promise.all([
          fetchReceiver(id),
          fetchReceiverCredentials(id),
        ]);
        if (cancelled) return;
        setProfile(profileRes.receiver);
        setCredentials({
          loginId: credRes.loginId,
          temporaryPassword: credRes.temporaryPassword,
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setNotFound(true);
        } else {
          setError(
            err instanceof ApiError
              ? err.message
              : 'Failed to load credentials.',
          );
          setNotFound(true);
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
        <p style={{color: '#6b7280'}}>Loading credentials…</p>
      </div>
    );
  }

  if (notFound || !profile || !credentials) {
    return <Navigate to="/share-credentials" replace />;
  }

  async function copyValue(field: Exclude<CopiedField, null>, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      window.alert('Could not copy. Please copy manually.');
    }
  }

  function shareCredentials() {
    const text = `Callkaro login credentials for ${profile!.name}
Login ID: ${credentials!.loginId}
Temporary Password: ${credentials!.temporaryPassword}`;

    if (navigator.share) {
      void navigator.share({
        title: `Credentials — ${profile!.name}`,
        text,
      });
      return;
    }

    void copyValue('loginId', text);
    window.alert('Credentials copied to clipboard.');
  }

  return (
    <div className={styles.page}>
      <p className={styles.crumb}>Share Credentials</p>
      <h1 className={styles.title}>Share Credentials</h1>
      <p className={styles.subtitle}>Share credentials of Profile</p>
      {error ? <p style={{color: '#dc2626'}}>{error}</p> : null}

      <Card className={styles.card} padding="lg">
        <h2 className={styles.sectionTitle}>Basic Information</h2>
        <dl className={styles.infoGrid}>
          <div>
            <dt>Name</dt>
            <dd>{profile.name}</dd>
          </div>
          <div>
            <dt>Age</dt>
            <dd>{profile.age}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{profile.gender}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>
              <Badge tone={levelTone(profile.level)}>Level {profile.level}</Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <div className={styles.fields}>
        <label className={styles.field} htmlFor="login-id">
          <span className={styles.label}>Login ID</span>
          <div className={styles.inputRow}>
            <input
              id="login-id"
              className={styles.input}
              value={credentials.loginId}
              readOnly
            />
            <button
              type="button"
              className={styles.copyBtn}
              aria-label="Copy login ID"
              onClick={() => copyValue('loginId', credentials.loginId)}
            >
              {copied === 'loginId' ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </label>

        <label className={styles.field} htmlFor="temp-password">
          <span className={styles.label}>Temporary Password</span>
          <div className={styles.inputRow}>
            <input
              id="temp-password"
              className={styles.input}
              value={credentials.temporaryPassword}
              readOnly
            />
            <button
              type="button"
              className={styles.copyBtn}
              aria-label="Copy temporary password"
              onClick={() =>
                copyValue('temporaryPassword', credentials.temporaryPassword)
              }
            >
              {copied === 'temporaryPassword' ? (
                <Check size={16} />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </label>
      </div>

      <div className={styles.actions}>
        <Button variant="outline" fullWidth onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Share2 size={16} />}
          onClick={shareCredentials}
        >
          Share Credentials
        </Button>
      </div>
    </div>
  );
}
