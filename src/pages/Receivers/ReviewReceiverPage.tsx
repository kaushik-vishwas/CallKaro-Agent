import {useEffect, useRef, useState} from 'react';
import {Link, Navigate, useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, Check, Download, Play, Plus, X} from 'lucide-react';
import {Badge, Button, Card, Input, TextArea} from '../../components/ui';
import {
  fetchReceiver,
  submitReceiverForReview,
  updateReceiverProxyProfile,
  uploadAgentPhoto,
  uploadAgentVideo,
} from '../../api/agent';
import {ApiError} from '../../api/client';
import {
  levelTone,
  statusTone,
  type ReceiverProfile,
  type ReceiverStatus,
} from '../../data/mockReceivers';
import styles from './ReviewReceiverPage.module.css';

type ProxyDraft = {
  enabled: boolean;
  name: string;
  bio: string;
  photos: string[];
  /** Storage keys/URLs persisted to API */
  photoKeys: string[];
  videoUrl: string;
  videoKey: string;
  videoThumb: string;
  videoThumbKey: string;
};

function emptyProxyDraft(): ProxyDraft {
  return {
    enabled: false,
    name: '',
    bio: '',
    photos: [],
    photoKeys: [],
    videoUrl: '',
    videoKey: '',
    videoThumb: '',
    videoThumbKey: '',
  };
}

function draftFromProfile(profile: ReceiverProfile): ProxyDraft {
  const proxy = profile.proxyProfile;
  const photos = proxy?.photos ?? [];
  return {
    enabled: Boolean(proxy?.enabled),
    name: proxy?.name || '',
    bio: proxy?.bio || '',
    photos,
    photoKeys: [...photos],
    videoUrl: proxy?.videoUrl || '',
    videoKey: proxy?.videoUrl || '',
    videoThumb: proxy?.videoThumb || '',
    videoThumbKey: proxy?.videoThumb || '',
  };
}

export function ReviewReceiverPage() {
  const {id = ''} = useParams();
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ReceiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState('');
  const [proxyMessage, setProxyMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [proxyBusy, setProxyBusy] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [proxyVideoOpen, setProxyVideoOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [proxyDraft, setProxyDraft] = useState<ProxyDraft>(emptyProxyDraft());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      setActionError('');
      setProxyMessage('');
      try {
        const data = await fetchReceiver(id);
        if (cancelled) return;
        setProfile(data.receiver);
        setPhotos(data.receiver.photos ?? []);
        setProxyDraft(draftFromProfile(data.receiver));
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

  async function onProxyPhotoSelected(file: File | null) {
    if (!file || proxyDraft.photos.length >= 5) return;
    setProxyBusy(true);
    setActionError('');
    setProxyMessage('');
    try {
      const uploaded = await uploadAgentPhoto(file);
      const storageKey = uploaded.storageUrl || uploaded.key || uploaded.url;
      const previewUrl = uploaded.url || storageKey;
      setProxyDraft(prev => ({
        ...prev,
        photos: [...prev.photos, previewUrl].slice(0, 5),
        photoKeys: [...prev.photoKeys, storageKey].slice(0, 5),
      }));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to upload photo.',
      );
    } finally {
      setProxyBusy(false);
    }
  }

  async function onProxyVideoSelected(file: File | null) {
    if (!file) return;
    setProxyBusy(true);
    setActionError('');
    setProxyMessage('');
    try {
      const uploaded = await uploadAgentVideo(file);
      const storageKey = uploaded.storageUrl || uploaded.key || uploaded.url;
      const previewUrl = uploaded.url || storageKey;
      setProxyDraft(prev => ({
        ...prev,
        videoUrl: previewUrl,
        videoKey: storageKey,
        videoThumb: prev.photos[0] || prev.videoThumb,
        videoThumbKey: prev.photoKeys[0] || prev.videoThumbKey,
      }));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : 'Failed to upload video.',
      );
    } finally {
      setProxyBusy(false);
    }
  }

  async function saveProxyProfile() {
    if (!profile) return;
    setProxyBusy(true);
    setActionError('');
    setProxyMessage('');
    try {
      const result = await updateReceiverProxyProfile(profile.id, {
        enabled: proxyDraft.enabled,
        name: proxyDraft.name.trim(),
        bio: proxyDraft.bio.trim(),
        photos: proxyDraft.photoKeys,
        videoUrl: proxyDraft.videoKey || '',
        videoThumb: proxyDraft.videoThumbKey || proxyDraft.photoKeys[0] || '',
      });
      setProfile(result.receiver);
      setPhotos(result.receiver.photos ?? []);
      setProxyDraft(draftFromProfile(result.receiver));
      setProxyMessage(
        result.receiver.proxyProfile?.enabled
          ? 'Proxy profile saved. Callers will see this identity.'
          : 'Proxy profile saved (disabled for callers).',
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Failed to save proxy profile.',
      );
    } finally {
      setProxyBusy(false);
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
                  setProxyDraft(draftFromProfile(refreshed.receiver));
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
      {proxyMessage ? (
        <p style={{color: '#059669', marginBottom: 16}}>{proxyMessage}</p>
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
            <div className={styles.proxyHeader}>
              <div>
                <h2 className={styles.sectionTitle} style={{marginBottom: 6}}>
                  Caller proxy profile
                </h2>
                <p className={styles.proxyHint}>
                  Fake / public identity shown only on the caller app. Receiver
                  app keeps the real name and photos unchanged.
                </p>
              </div>
              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={proxyDraft.enabled}
                  disabled={proxyBusy}
                  onChange={event =>
                    setProxyDraft(prev => ({
                      ...prev,
                      enabled: event.target.checked,
                    }))
                  }
                />
                <span>Show proxy to callers</span>
              </label>
            </div>

            <div className={styles.proxyForm}>
              <Input
                label="Proxy display name"
                placeholder="Name callers will see"
                value={proxyDraft.name}
                disabled={proxyBusy}
                onChange={event =>
                  setProxyDraft(prev => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />

              <TextArea
                label="Proxy bio"
                placeholder="Short bio callers will see"
                value={proxyDraft.bio}
                disabled={proxyBusy}
                rows={4}
                maxLength={250}
                hint={`${proxyDraft.bio.length}/250`}
                onChange={event =>
                  setProxyDraft(prev => ({
                    ...prev,
                    bio: event.target.value.slice(0, 250),
                  }))
                }
              />

              <div>
                <p className={styles.fieldLabel}>
                  Proxy photos ({proxyDraft.photos.length}/5)
                </p>
                <div className={styles.photoGrid}>
                  {proxyDraft.photos.map((photo, index) => (
                    <div
                      key={`proxy-photo-${index}`}
                      className={styles.photoWrap}
                    >
                      <img
                        src={photo}
                        alt={`Proxy photo ${index + 1}`}
                        className={styles.photo}
                      />
                      <button
                        type="button"
                        className={styles.photoRemove}
                        aria-label="Remove photo"
                        disabled={proxyBusy}
                        onClick={() =>
                          setProxyDraft(prev => ({
                            ...prev,
                            photos: prev.photos.filter((_, i) => i !== index),
                            photoKeys: prev.photoKeys.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {proxyDraft.photos.length < 5 ? (
                    <button
                      type="button"
                      className={styles.photoAdd}
                      disabled={proxyBusy}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  ) : null}
                </div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={event => {
                    const file = event.target.files?.[0] || null;
                    event.target.value = '';
                    void onProxyPhotoSelected(file);
                  }}
                />
              </div>

              <div>
                <p className={styles.fieldLabel}>Proxy intro video (optional)</p>
                {proxyDraft.videoUrl ? (
                  <div className={styles.videoCard}>
                    <div
                      className={styles.videoThumb}
                      style={{
                        backgroundImage: proxyDraft.videoThumb
                          ? `url(${proxyDraft.videoThumb})`
                          : proxyDraft.photos[0]
                            ? `url(${proxyDraft.photos[0]})`
                            : undefined,
                      }}
                    >
                      <Button
                        variant="primary"
                        leftIcon={<Play size={16} />}
                        onClick={() => setProxyVideoOpen(true)}
                      >
                        Preview
                      </Button>
                    </div>
                    <div className={styles.proxyVideoActions}>
                      <Button
                        variant="outline"
                        disabled={proxyBusy}
                        onClick={() => videoInputRef.current?.click()}
                      >
                        Replace video
                      </Button>
                      <Button
                        variant="outline"
                        disabled={proxyBusy}
                        onClick={() =>
                          setProxyDraft(prev => ({
                            ...prev,
                            videoUrl: '',
                            videoKey: '',
                            videoThumb: '',
                            videoThumbKey: '',
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    disabled={proxyBusy}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    Upload video
                  </Button>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={event => {
                    const file = event.target.files?.[0] || null;
                    event.target.value = '';
                    void onProxyVideoSelected(file);
                  }}
                />
              </div>

              <Button
                variant="primary"
                disabled={proxyBusy}
                onClick={() => void saveProxyProfile()}
              >
                {proxyBusy ? 'Saving…' : 'Save proxy profile'}
              </Button>
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
              <div>
                <dt>Caller identity</dt>
                <dd>
                  {proxyDraft.enabled && proxyDraft.name.trim()
                    ? `Proxy · ${proxyDraft.name.trim()}`
                    : 'Real profile'}
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

      {proxyVideoOpen && proxyDraft.videoUrl ? (
        <div
          className={styles.videoOverlay}
          role="presentation"
          onClick={() => setProxyVideoOpen(false)}
        >
          <div
            className={styles.videoModal}
            role="dialog"
            aria-modal="true"
            aria-label="Proxy video player"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.videoClose}
              aria-label="Close video"
              onClick={() => setProxyVideoOpen(false)}
            >
              <X size={18} />
            </button>
            <video
              className={styles.videoPlayer}
              src={proxyDraft.videoUrl}
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
