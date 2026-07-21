/**
 * Resolves API base URL automatically:
 * - Local `npm run dev` → Vite proxy `/ck-api` (no .env needed)
 * - Production build / Vercel → VITE_API_BASE_URL or live backend
 *
 * Override anytime with VITE_API_BASE_URL in .env / Vercel env.
 */
const PRODUCTION_API_BASE_URL = 'https://callkaro.delicod.com/api';
const PRODUCTION_ONBOARDING_BASE_URL =
  'https://callkaro-onbaord-receiver.vercel.app';

export function getApiBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (import.meta.env.DEV) return '/ck-api';

  return PRODUCTION_API_BASE_URL;
}

export function getOnboardingBaseUrl(): string {
  const fromEnv = (
    import.meta.env.VITE_ONBOARDING_BASE_URL as string | undefined
  )?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (import.meta.env.DEV) return 'http://localhost:5174';

  return PRODUCTION_ONBOARDING_BASE_URL;
}

/**
 * Backend may still return localhost links if ONBOARDING_BASE_URL is wrong.
 * Always rewrite the origin to match this frontend environment.
 */
export function toClientOnboardingLink(linkFromApi: string): string {
  const raw = (linkFromApi || '').trim();
  if (!raw) return raw;

  const base = getOnboardingBaseUrl();

  try {
    const parsed = new URL(raw, base);
    return `${base}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    if (raw.startsWith('/')) return `${base}${raw}`;
    return raw;
  }
}
