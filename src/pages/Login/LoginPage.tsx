import {useState, type FormEvent} from 'react';
import {Navigate, useLocation, useNavigate} from 'react-router-dom';
import {Button, Card, Input} from '../../components/ui';
import {ApiError} from '../../api/client';
import {useAuth} from '../../auth/AuthContext';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const {agent, loading, login} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as {from?: string} | null)?.from || '/';

  const [email, setEmail] = useState('agent@callkaro.com');
  const [password, setPassword] = useState('password123');
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
            type="password"
            label="Password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {error ? <p className={styles.error}>{error}</p> : null}
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

        <p className={styles.hint}>
          Demo: agent@callkaro.com / password123
        </p>
      </Card>
    </div>
  );
}
