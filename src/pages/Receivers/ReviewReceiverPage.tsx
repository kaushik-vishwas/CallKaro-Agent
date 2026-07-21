import {useEffect, useState} from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Ban,
  Check,
  CircleCheck,
  CircleMinus,
  Download,
  OctagonX,
  Play,
  X,
} from 'lucide-react';
import {Badge, Button, Card, Modal, TextArea} from '../../components/ui';
import {
  approveReceiver,
  fetchReceiver,
  rejectReceiver,
  requestReceiverChanges,
  submitReceiverForReview,
  terminateReceiver,
} from '../../api/agent';
import {ApiError} from '../../api/client';
import {
  levelTone,
  statusTone,
  type ReceiverProfile,
  type ReceiverStatus,
} from '../../data/mockReceivers';
import styles from './ReviewReceiverPage.module.css';

type ReviewMode = 'manage' | 'approval';

export function ReviewReceiverPage() {
  const {id = ''} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const mode: ReviewMode = location.pathname.startsWith('/pending-approvals')
    ? 'approval'
    : 'manage';

  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
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

  useEffect(() => {
    if (!rejectOpen) {
      setRejectReason('');
      setRejectError('');
    }
  }, [rejectOpen]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p style={{color: '#6b7280'}}>Loading receiver…</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <Navigate
        to={mode === 'approval' ? '/pending-approvals' : '/receivers'}
        replace
      />
    );
  }

  const backTo = mode === 'approval' ? '/pending-approvals' : '/receivers';
  const backLabel =
    mode === 'approval' ? 'Back to Approvals' : 'Back to Receivers';
  const displayStatus =
    mode === 'approval' ? 'Pending Review' : profile.status;

  function removePhoto(index: number) {
    setPhotos(current => current.filter((_, i) => i !== index));
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

  async function confirmReject() {
    if (!profile) return;
    if (!rejectReason.trim()) {
      setRejectError(
        mode === 'approval'
          ? 'Please enter a rejection reason.'
          : 'Please enter a termination reason.',
      );
      return;
    }
    const receiverId = profile.id;
    const reason = rejectReason.trim();
    await runAction(async () => {
      if (mode === 'approval') {
        await rejectReceiver(receiverId, reason);
        setRejectOpen(false);
        navigate('/pending-approvals');
      } else {
        await terminateReceiver(receiverId, reason);
        setRejectOpen(false);
        navigate('/receivers');
      }
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <Link to={backTo} className={styles.backLink}>
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
          <h1 className={styles.title}>Review Receiver Profile</h1>
          <p className={styles.subtitle}>
            Verify all information before approving the receiver.
          </p>
        </div>
        <div className={styles.actions}>
          {mode === 'approval' ? (
            <>
              <Button
                variant="danger"
                leftIcon={<CircleMinus size={16} />}
                disabled={busy}
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
              <Button
                variant="warning"
                leftIcon={<AlertCircle size={16} />}
                disabled={busy}
                onClick={() =>
                  void runAction(async () => {
                    await requestReceiverChanges(profile.id);
                    navigate('/pending-approvals');
                  })
                }
              >
                Request Changes
              </Button>
              <Button
                variant="primary"
                leftIcon={<CircleCheck size={16} />}
                disabled={busy}
                onClick={() =>
                  void runAction(async () => {
                    await approveReceiver(profile.id);
                    navigate(`/pending-approvals/${profile.id}/approved`);
                  })
                }
              >
                Approve Receiver
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="danger"
                leftIcon={<OctagonX size={16} />}
                disabled={busy}
                onClick={() => setRejectOpen(true)}
              >
                Terminate
              </Button>
              <Button
                variant="dark"
                leftIcon={<Ban size={16} />}
                disabled={busy}
                onClick={() =>
                  window.alert(
                    `Temporary block is not wired yet for ${profile.name}.`,
                  )
                }
              >
                Block 48 Hours
              </Button>
              {profile.status === 'Pending Review' ? (
                <Button
                  variant="primary"
                  leftIcon={<Check size={16} />}
                  disabled={busy}
                  onClick={() =>
                    void runAction(async () => {
                      await approveReceiver(profile.id);
                      navigate(`/pending-approvals/${profile.id}/approved`);
                    })
                  }
                >
                  Approve Receiver
                </Button>
              ) : profile.status === 'Inactive' ? (
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
            </>
          )}
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
                <div key={`${profile.id}-photo-${index}`} className={styles.photoWrap}>
                  <img
                    src={photo}
                    alt={`${profile.name} photo ${index + 1}`}
                    className={styles.photo}
                  />
                  {mode === 'approval' ? (
                    <button
                      type="button"
                      className={styles.photoRemove}
                      aria-label={`Remove photo ${index + 1}`}
                      onClick={() => removePhoto(index)}
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  ) : null}
                </div>
              ))}
              {!photos.length ? (
                <p style={{color: '#6b7280', margin: 0}}>No photos uploaded yet.</p>
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
                <dd>
                  {mode === 'approval' && profile.bank.accountNumber
                    ? `****${profile.bank.accountNumber.slice(-4)}`
                    : profile.bank.accountNumber || '—'}
                </dd>
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
                  <Badge
                    tone={statusTone(displayStatus as ReceiverStatus)}
                  >
                    {displayStatus}
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
                <p className={styles.videoEmpty}>No verification video uploaded yet.</p>
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
                      if (doc.url) window.open(doc.url, '_blank', 'noopener,noreferrer');
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

      <Modal
        open={rejectOpen}
        title={
          mode === 'approval'
            ? 'Reject Receiver Profile'
            : 'Terminate Receiver Profile'
        }
        description={
          mode === 'approval'
            ? 'Please provide a reason for rejecting this profile. The receiver will be notified.'
            : 'Please provide a reason for terminating this profile. The receiver will be notified.'
        }
        onClose={() => setRejectOpen(false)}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="dangerSolid"
              disabled={busy}
              onClick={() => void confirmReject()}
            >
              {mode === 'approval' ? 'Reject Profile' : 'Terminate Profile'}
            </Button>
          </>
        }
      >
        <TextArea
          name="rejectReason"
          placeholder={
            mode === 'approval'
              ? 'Enter rejection reason...'
              : 'Enter termination reason...'
          }
          value={rejectReason}
          onChange={event => {
            setRejectReason(event.target.value);
            if (rejectError) setRejectError('');
          }}
          error={rejectError}
          rows={5}
        />
      </Modal>
    </div>
  );
}
