import {useState, type FormEvent} from 'react';
import {Eye, EyeOff} from 'lucide-react';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {Button, Card, Input} from '../../components/ui';
import {ApiError} from '../../api/client';
import {useAuth} from '../../auth/AuthContext';
import styles from './LoginPage.module.css';

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;

/** Shows an email address inside an error as a link that opens Gmail compose. */
function withMailLink(text: string) {
  const match = text.match(EMAIL_PATTERN);
  if (!match) return text;
  const email = match[0];
  const [before, after] = text.split(email);
  const href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
  return (
    <>
      {before}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{color: 'inherit', fontWeight: 700, textDecoration: 'underline'}}
      >
        {email}
      </a>
      {after}
    </>
  );
}

export function LoginPage() {
  const {agent, loading, login} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as {from?: string} | null)?.from || '/';

  const [email, setEmail] = useState('agent@callkaro.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && agent) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, {replace: true});
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Login failed. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card} padding="lg">
        <div className={styles.brand}>
          <span className={styles.mark}>C</span>
          <h1 className={styles.title}>Callkaro Agent</h1>
          <p className={styles.subtitle}>Sign in to manage receivers</p>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <Input
            name="email"
            type="email"
            label="Email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            rightAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                // The input's adornment slot ignores pointer events; re-enable for this button.
                style={{
                  pointerEvents: 'auto',
                  background: 'none',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  color: 'inherit',
                  display: 'inline-flex',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          {error ? <p className={styles.error}>{withMailLink(error)}</p> : null}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={submitting || loading}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
