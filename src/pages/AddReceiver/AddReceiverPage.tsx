import {useMemo, useState, type FormEvent} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Medal,
  QrCode,
  User,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  Input,
  Select,
  SelectionCardGroup,
} from '../../components/ui';
import {createReceiver as createReceiverApi} from '../../api/agent';
import {ApiError} from '../../api/client';
import styles from './AddReceiverPage.module.css';

type Gender = 'male' | 'female' | 'other';
type Level = '1' | '2' | '3';

type ReceiverDraft = {
  name: string;
  age: string;
  gender: Gender | '';
  level: Level | '';
};

type CreatedReceiver = {
  name: string;
  age: string;
  gender: Gender;
  level: Level;
  onboardingLink: string;
};

const GENDER_OPTIONS = [
  {value: 'male', label: 'Male'},
  {value: 'female', label: 'Female'},
  {value: 'other', label: 'Other'},
];

const LEVEL_OPTIONS = [
  {value: '1', title: 'Level 1', subtitle: '₹10/min'},
  {value: '2', title: 'Level 2', subtitle: '₹15/min'},
  {value: '3', title: 'Level 3', subtitle: '₹20/min'},
];

const NEXT_STEPS = [
  'Share the onboarding link with the receiver via WhatsApp or other messaging platforms.',
  'Receiver will complete their profile by adding photos, bio, languages, and availability.',
  'Receiver will submit KYC documents and bank details for verification.',
  'You will review and approve the completed profile before activation.',
];

const EMPTY_FORM: ReceiverDraft = {
  name: '',
  age: '',
  gender: '',
  level: '',
};

function genderLabel(gender: Gender): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function AddReceiverPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ReceiverDraft>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ReceiverDraft, string>>>({});
  const [created, setCreated] = useState<CreatedReceiver | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const isFormComplete = useMemo(() => {
    const ageNum = Number(form.age);
    return (
      form.name.trim().length > 1 &&
      Number.isFinite(ageNum) &&
      ageNum >= 18 &&
      ageNum <= 80 &&
      Boolean(form.gender) &&
      Boolean(form.level)
    );
  }, [form]);

  function validate(): boolean {
    const next: Partial<Record<keyof ReceiverDraft, string>> = {};
    if (!form.name.trim()) next.name = 'Receiver name is required.';
    const ageNum = Number(form.age);
    if (!form.age.trim()) next.age = 'Age is required.';
    else if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 80) {
      next.age = 'Enter a valid age between 18 and 80.';
    }
    if (!form.gender) next.gender = 'Select a gender.';
    if (!form.level) next.level = 'Select a level.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submitReceiver(asDraft: boolean, event?: FormEvent) {
    event?.preventDefault();
    if (!validate()) return;

    setFormError('');
    setSubmitting(true);
    try {
      const name = form.name.trim();
      const result = await createReceiverApi({
        name,
        age: Number(form.age),
        gender: form.gender as Gender,
        level: Number(form.level),
        asDraft,
      });

      if (asDraft) {
        window.alert('Receiver saved as draft.');
        navigate('/receivers');
        return;
      }

      setCreated({
        name,
        age: form.age.trim(),
        gender: form.gender as Gender,
        level: form.level as Level,
        onboardingLink: result.onboardingLink,
      });
      setCopied(false);
      setShowQr(false);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Could not create receiver.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function createReceiver(event?: FormEvent) {
    void submitReceiver(false, event);
  }

  function saveReceiver() {
    void submitReceiver(true);
  }

  async function copyLink() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.onboardingLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert('Could not copy link. Copy it manually from the field.');
    }
  }

  function shareWhatsApp() {
    if (!created) return;
    const text = encodeURIComponent(
      `Hi ${created.name}, complete your Callkaro onboarding: ${created.onboardingLink}`,
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  }

  function openOnboardingPage() {
    if (!created?.onboardingLink) return;
    window.open(created.onboardingLink, '_blank', 'noopener,noreferrer');
  }

  function resetToForm() {
    setCreated(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setCopied(false);
    setShowQr(false);
  }

  if (created) {
    return (
      <div className={styles.page}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className={styles.title}>Onboarding Link Generated</h1>
        <p className={styles.subtitle}>
          Share this link with the receiver to complete their profile
        </p>

        <Card className={styles.successCard} padding="lg">
          <div className={styles.successHero}>
            <span className={styles.successIcon} aria-hidden>
              <Check size={28} strokeWidth={2.75} />
            </span>
            <h2 className={styles.successTitle}>Receiver Profile Created Successfully!</h2>
            <p className={styles.successSubtitle}>
              Onboarding link has been generated for {created.name}
            </p>
          </div>

          <div className={styles.detailsBox}>
            <h3 className={styles.detailsHeading}>Receiver Details</h3>
            <dl className={styles.detailsGrid}>
              <div>
                <dt>Name</dt>
                <dd>{created.name}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{created.age}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{genderLabel(created.gender)}</dd>
              </div>
              <div>
                <dt>Level</dt>
                <dd className={styles.levelValue}>Level {created.level}</dd>
              </div>
            </dl>
          </div>

          <div className={styles.linkBlock}>
            <label className={styles.linkLabel} htmlFor="onboarding-link">
              Onboarding Link
            </label>
            <div className={styles.linkRow}>
              <input
                id="onboarding-link"
                className={styles.linkInput}
                value={created.onboardingLink}
                readOnly
              />
              <Button
                variant="primary"
                leftIcon={<Copy size={16} />}
                onClick={copyLink}
                className={styles.copyButton}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className={styles.shareRow}>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              leftIcon={<ExternalLink size={18} />}
              onClick={openOnboardingPage}
            >
              Open Onboarding Page
            </Button>
            <Button
              variant="whatsapp"
              fullWidth
              size="lg"
              leftIcon={<WhatsAppIcon />}
              onClick={shareWhatsApp}
            >
              Share via WhatsApp
            </Button>
            <Button
              variant="soft"
              fullWidth
              size="lg"
              leftIcon={<QrCode size={18} />}
              onClick={() => setShowQr(value => !value)}
            >
              Generate QR Code
            </Button>
          </div>

          {showQr ? (
            <div className={styles.qrBox} aria-live="polite">
              <div className={styles.qrPlaceholder}>
                <QrCode size={72} strokeWidth={1.25} />
              </div>
              <p className={styles.qrHint}>
                QR preview for {created.onboardingLink}
              </p>
            </div>
          ) : null}
        </Card>

        <Card className={styles.nextStepsCard} padding="lg">
          <h3 className={styles.nextStepsTitle}>Next Steps</h3>
          <ol className={styles.nextStepsList}>
            {NEXT_STEPS.map((step, index) => (
              <li key={step} className={styles.nextStepItem}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className={styles.footerActions}>
          <Button
            variant="outline"
            fullWidth
            size="lg"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
          <Button variant="primary" fullWidth size="lg" onClick={resetToForm}>
            Create Another Receiver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>
      <h1 className={styles.title}>Create Receiver</h1>
      <p className={styles.subtitle}>
        Add basic receiver information to generate onboarding link
      </p>

      <Card className={styles.formCard} padding="lg">
        <form className={styles.form} onSubmit={createReceiver} noValidate>
          <Input
            name="name"
            label="Receiver Name"
            labelIcon={<User size={15} />}
            placeholder="Enter receiver name"
            value={form.name}
            onChange={event => setForm(prev => ({...prev, name: event.target.value}))}
            error={errors.name}
            autoComplete="name"
          />

          <Input
            name="age"
            type="number"
            min={18}
            max={80}
            label="Age"
            labelIcon={<CalendarDays size={15} />}
            placeholder="Enter age"
            value={form.age}
            onChange={event => setForm(prev => ({...prev, age: event.target.value}))}
            error={errors.age}
          />

          <Select
            name="gender"
            label="Gender"
            labelIcon={<Users size={15} />}
            placeholder="Select Gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={event =>
              setForm(prev => ({
                ...prev,
                gender: event.target.value as Gender | '',
              }))
            }
            error={errors.gender}
          />

          <SelectionCardGroup
            label="Level"
            labelIcon={<Medal size={15} />}
            options={LEVEL_OPTIONS}
            value={form.level}
            onChange={value => setForm(prev => ({...prev, level: value as Level}))}
            error={errors.level}
          />

          {formError ? (
            <p style={{margin: 0, color: '#dc2626', fontSize: '0.875rem'}}>
              {formError}
            </p>
          ) : null}

          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="muted"
              size="lg"
              fullWidth
              disabled={!isFormComplete || submitting}
            >
              {submitting ? 'Creating…' : 'Generate Onboarding Link'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              disabled={submitting}
              onClick={saveReceiver}
            >
              Save Receiver
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
