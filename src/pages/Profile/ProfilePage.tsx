import {useEffect, useRef, useState, type FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {Lock, LogOut, Shield, UserRound} from 'lucide-react';
import {PageHeader} from '../../components/layout/PageHeader/PageHeader';
import {Button, Card, Input} from '../../components/ui';
import {
  updateAgentPassword,
  updateAgentProfile,
} from '../../api/agent';
import {ApiError} from '../../api/client';
import {useAuth} from '../../auth/AuthContext';
import styles from './ProfilePage.module.css';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=320&fit=crop';

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
  const {agent, logout, setAgent} = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
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

  useEffect(() => {
    if (!agent) return;
    setProfile({
      fullName: agent.name,
      email: agent.email,
      phone: agent.phone || '',
      agentCode: agent.agentCode,
    });
    setAvatarUrl(agent.avatarUrl || DEFAULT_AVATAR);
  }, [agent]);

  async function onUpdateProfile(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      const data = await updateAgentProfile({
        name: profile.fullName,
        phone: profile.phone,
        avatarUrl,
      });
      setAgent(data.agent);
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.message : 'Failed to update profile.',
      );
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
    }
  }

  function onPhotoSelected(file: File | null) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setMessage('Photo preview updated — click Update on profile to save URL.');
  }

  function onLogout() {
    logout();
    navigate('/login', {replace: true});
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences"
      />

      {message ? (
        <p style={{marginBottom: 16, color: '#059669'}}>{message}</p>
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
            <Button type="submit" variant="primary">
              Update
            </Button>
          </form>
        </Card>

        <Card className={styles.photoCard} padding="lg">
          <div className={styles.photoWrap}>
            <img src={avatarUrl} alt="Profile" className={styles.avatar} />
          </div>
          <p className={styles.photoHint}>Update Profile Picture</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenFile}
            onChange={event =>
              onPhotoSelected(event.target.files?.[0] ?? null)
            }
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Update Photo
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
          <Button type="submit" variant="primary" fullWidth size="lg">
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
