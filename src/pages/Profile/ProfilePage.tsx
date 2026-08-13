import {useEffect, useRef, useState, type FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {Lock, LogOut, Shield, UserRound} from 'lucide-react';
import {PageHeader} from '../../components/layout/PageHeader/PageHeader';
import {Button, Card, Input} from '../../components/ui';
import {
  fetchAgentMe,
  updateAgentPassword,
  updateAgentProfile,
  uploadAgentPhoto,
} from '../../api/agent';
import {ApiError} from '../../api/client';
import {useAuth} from '../../auth/AuthContext';
import styles from './ProfilePage.module.css';

type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  agentCode: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ProfilePage() {
  const {agent, logout, setAgent, refresh} = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profile, setProfile] = useState<ProfileForm>({
    fullName: '',
    email: '',
    phone: '',
    agentCode: '',
  });
  const [passwords, setPasswords] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchAgentMe()
      .then(data => {
        if (cancelled) return;
        setAgent(data.agent);
        setProfile({
          fullName: data.agent.name || '',
          email: data.agent.email || '',
          phone: data.agent.phone || '',
          agentCode: data.agent.agentCode || '',
        });
        setAvatarUrl(data.agent.avatarUrl || '');
      })
      .catch(err => {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load profile.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setAgent]);

  useEffect(() => {
    if (!agent) return;
    setProfile({
      fullName: agent.name,
      email: agent.email,
      phone: agent.phone || '',
      agentCode: agent.agentCode,
    });
    if (agent.avatarUrl) setAvatarUrl(agent.avatarUrl);
  }, [agent]);

  async function onUpdateProfile(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    try {
      const data = await updateAgentProfile({
        name: profile.fullName,
        phone: profile.phone,
        avatarUrl: avatarUrl || undefined,
      });
      setAgent(data.agent);
      setMessage('Profile updated.');
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to update profile.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function onUpdatePassword(event: FormEvent) {
    event.preventDefault();
    if (!passwords.currentPassword.trim()) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordError('');
    setMessage('');
    setError('');
    setBusy(true);
    try {
      await updateAgentPassword(
        passwords.currentPassword,
        passwords.newPassword,
      );
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setMessage('Password updated.');
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.message : 'Failed to update password.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function onPhotoSelected(file: File | null) {
    if (!file) return;
    setPhotoBusy(true);
    setError('');
    setMessage('');
    try {
      const uploaded = await uploadAgentPhoto(file);
      const nextUrl =
        uploaded.storageUrl || uploaded.key || uploaded.url;
      const previewUrl = uploaded.url || nextUrl;
      setAvatarUrl(previewUrl);
      const data = await updateAgentProfile({avatarUrl: nextUrl});
      setAgent(data.agent);
      if (data.agent.avatarUrl) setAvatarUrl(data.agent.avatarUrl);
      setMessage('Profile photo updated.');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to upload photo.',
      );
    } finally {
      setPhotoBusy(false);
    }
  }

  function onLogout() {
    logout();
    navigate('/login', {replace: true});
  }

  const initial = (profile.fullName || 'A').charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Profile"
        subtitle="Manage your account preferences"
      />

      {loading ? <p>Loading profile…</p> : null}
      {message ? (
        <p style={{marginBottom: 16, color: '#059669'}}>{message}</p>
      ) : null}
      {error ? (
        <p style={{marginBottom: 16, color: '#dc2626'}}>{error}</p>
      ) : null}

      <div className={styles.topGrid}>
        <Card className={styles.profileCard} padding="lg">
          <h2 className={styles.cardTitle}>
            <UserRound size={18} />
            Profile Settings
          </h2>
          <form className={styles.profileForm} onSubmit={onUpdateProfile}>
            <Input
              name="fullName"
              label="Full Name"
              value={profile.fullName}
              onChange={event =>
                setProfile(prev => ({...prev, fullName: event.target.value}))
              }
              required
            />
            <Input
              name="email"
              type="email"
              label="Email"
              value={profile.email}
              readOnly
              rightAdornment={<Lock size={15} />}
            />
            <div className={styles.twoCol}>
              <Input
                name="phone"
                label="Phone Number"
                value={profile.phone}
                onChange={event =>
                  setProfile(prev => ({...prev, phone: event.target.value}))
                }
              />
              <Input
                name="agentCode"
                label="Agent Code"
                value={profile.agentCode}
                readOnly
                rightAdornment={<Lock size={15} />}
              />
            </div>
            <Button type="submit" variant="primary" disabled={busy || loading}>
              {busy ? 'Saving…' : 'Update'}
            </Button>
          </form>
        </Card>

        <Card className={styles.photoCard} padding="lg">
          <div className={styles.photoWrap}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className={styles.avatar} />
            ) : (
              <div className={styles.avatar} aria-hidden>
                {initial}
              </div>
            )}
          </div>
          <p className={styles.photoHint}>Update Profile Picture</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenFile}
            onChange={event =>
              void onPhotoSelected(event.target.files?.[0] ?? null)
            }
          />
          <Button
            variant="primary"
            disabled={photoBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoBusy ? 'Uploading…' : 'Update Photo'}
          </Button>
        </Card>
      </div>

      <Card className={styles.securityCard} padding="lg">
        <h2 className={styles.cardTitle}>
          <Shield size={18} />
          Security
        </h2>
        <form className={styles.securityForm} onSubmit={onUpdatePassword}>
          <Input
            name="currentPassword"
            type="password"
            placeholder="Enter Password"
            value={passwords.currentPassword}
            onChange={event => {
              setPasswords(prev => ({
                ...prev,
                currentPassword: event.target.value,
              }));
              if (passwordError) setPasswordError('');
            }}
            autoComplete="current-password"
          />
          <Input
            name="newPassword"
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={event => {
              setPasswords(prev => ({
                ...prev,
                newPassword: event.target.value,
              }));
              if (passwordError) setPasswordError('');
            }}
            autoComplete="new-password"
          />
          <Input
            name="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            value={passwords.confirmPassword}
            onChange={event => {
              setPasswords(prev => ({
                ...prev,
                confirmPassword: event.target.value,
              }));
              if (passwordError) setPasswordError('');
            }}
            autoComplete="new-password"
            error={passwordError}
          />
          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            disabled={busy}
          >
            Update Password
          </Button>
        </form>
      </Card>

      <Button
        variant="soft"
        fullWidth
        size="lg"
        leftIcon={<LogOut size={18} />}
        className={styles.logout}
        onClick={onLogout}
      >
        Log Out
      </Button>
    </div>
  );
}
