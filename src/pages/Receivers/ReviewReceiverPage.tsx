import {useEffect, useState} from 'react';
import {Link, Navigate, useNavigate, useParams} from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Download,
  Play,
  X,
} from 'lucide-react';
import {Badge, Button, Card} from '../../components/ui';
import {fetchReceiver, submitReceiverForReview} from '../../api/agent';
import {ApiError} from '../../api/client';
import {
  levelTone,
  statusTone,
  type ReceiverProfile,
  type ReceiverStatus,
} from '../../data/mockReceivers';
import styles from './ReviewReceiverPage.module.css';

export function ReviewReceiverPage() {
  const {id = ''} = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      setActionError('');
      try {
        const data = await fetchReceiver(id);
        if (cancelled) return;
        setProfile(data.receiver);
        setPhotos(data.receiver.photos ?? []);
      } catch {
        if (!cancelled) setNotFound(true);
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
        <p style={{color: '#6b7280'}}>Loading receiver…</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return <Navigate to="/receivers" replace />;
  }

  async function runAction(fn: () => Promise<void>) {
    setBusy(true);
    setActionError('');
    try {
      await fn();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Action failed. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <Link to="/receivers" className={styles.backLink}>
            <ArrowLeft size={16} />
            Back to Receivers
          </Link>
          <h1 className={styles.title}>Receiver Profile</h1>
          <p className={styles.subtitle}>
            View receiver details. Approvals are handled by admin.
          </p>
        </div>
        <div className={styles.actions}>
          {profile.status === 'Inactive' ? (
            <Button
              variant="primary"
              leftIcon={<Check size={16} />}
              disabled={busy}
              onClick={() =>
                void runAction(async () => {
                  await submitReceiverForReview(profile.id);
                  const refreshed = await fetchReceiver(profile.id);
                  setProfile(refreshed.receiver);
                  setPhotos(refreshed.receiver.photos ?? []);
                })
              }
            >
              Submit for Review
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() => navigate(`/share-credentials/${profile.id}`)}
          >
            Share Credentials
          </Button>
        </div>
      </div>

      {actionError ? (
        <p style={{color: '#dc2626', marginBottom: 16}}>{actionError}</p>
      ) : null}

      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <Card className={styles.section} padding="lg">
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
                  <Badge tone={levelTone(profile.level)}>
                    Level {profile.level}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card className={styles.section} padding="lg">
            <h2 className={styles.sectionTitle}>
              Profile Photos ({photos.length})
            </h2>
            <div className={styles.photoGrid}>
              {photos.map((photo, index) => (
                <div
                  key={`${profile.id}-photo-${index}`}
                  className={styles.photoWrap}
                >
                  <img
                    src={photo}
                    alt={`${profile.name} photo ${index + 1}`}
                    className={styles.photo}
                  />
                </div>
              ))}
              {!photos.length ? (
                <p style={{color: '#6b7280', margin: 0}}>
                  No photos uploaded yet.
                </p>
              ) : null}
            </div>
          </Card>

          <Card className={styles.section} padding="lg">
            <h2 className={styles.sectionTitle}>Bio</h2>
            <p className={styles.bio}>{profile.bio || 'No bio yet.'}</p>
          </Card>

          <Card className={styles.section} padding="lg">
            <h2 className={styles.sectionTitle}>Languages</h2>
            <div className={styles.tags}>
              {(profile.languages || []).map(language => (
                <span key={language} className={styles.tag}>
                  {language}
                </span>
              ))}
              {!profile.languages?.length ? (
                <span style={{color: '#6b7280'}}>None listed</span>
              ) : null}
            </div>
          </Card>

          <Card className={styles.section} padding="lg">
            <h2 className={styles.sectionTitle}>Bank Account Details</h2>
            <dl className={styles.bankList}>
              <div>
                <dt>Account Holder Name</dt>
                <dd>{profile.bank.holderName || '—'}</dd>
              </div>
              <div>
                <dt>Account Number</dt>
                <dd>{profile.bank.accountNumber || '—'}</dd>
              </div>
              <div>
                <dt>IFSC Code</dt>
                <dd>{profile.bank.ifsc || '—'}</dd>
              </div>
              <div>
                <dt>UPI ID</dt>
                <dd>{profile.bank.upiId || '—'}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className={styles.rightCol}>
          <Card className={styles.section} padding="lg">
            <h2 className={styles.sectionTitle}>Submission Info</h2>
            <dl className={styles.bankList}>
              <div>
                <dt>Receiver ID</dt>
                <dd>{profile.id}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{profile.submittedAgo || '—'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <Badge tone={statusTone(profile.status as ReceiverStatus)}>
                    {profile.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card className={styles.section} padding="lg">
            <h2 className={styles.sectionTitle}>KYC Details</h2>

            <div className={styles.videoCard}>
              <p className={styles.videoLabel}>Video Verification</p>
              {profile.kyc.videoUrl ? (
                <div
                  className={styles.videoThumb}
                  style={{
                    backgroundImage: profile.kyc.videoThumb
                      ? `url(${profile.kyc.videoThumb})`
                      : undefined,
                  }}
                >
                  <Button
                    variant="primary"
                    leftIcon={<Play size={16} />}
                    onClick={() => setVideoOpen(true)}
                  >
                    Play Video
                  </Button>
                </div>
              ) : (
                <p className={styles.videoEmpty}>
                  No verification video uploaded yet.
                </p>
              )}
            </div>

            <ul className={styles.docList}>
              {(profile.kyc.documents || []).map(doc => (
                <li key={doc.id} className={styles.docItem}>
                  <img
                    src={doc.thumbnail || doc.url}
                    alt=""
                    className={styles.docThumb}
                  />
                  <div className={styles.docMeta}>
                    <p className={styles.docTitle}>{doc.title}</p>
                    <p className={styles.docSize}>{doc.sizeLabel}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.downloadBtn}
                    aria-label={`Open ${doc.title}`}
                    disabled={!doc.url}
                    onClick={() => {
                      if (doc.url)
                        window.open(doc.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Download size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {videoOpen && profile.kyc.videoUrl ? (
        <div
          className={styles.videoOverlay}
          role="presentation"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className={styles.videoModal}
            role="dialog"
            aria-modal="true"
            aria-label="Video verification player"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.videoClose}
              aria-label="Close video"
              onClick={() => setVideoOpen(false)}
            >
              <X size={18} />
            </button>
            <video
              className={styles.videoPlayer}
              src={profile.kyc.videoUrl}
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
