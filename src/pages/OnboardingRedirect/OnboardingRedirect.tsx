import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {getOnboardingBaseUrl} from '../../config/env';

/**
 * Agent panel must open the separate receiver-onboarding app.
 * Local → localhost:5174 · Production → Vercel onboarding URL.
 */
export function OnboardingRedirect() {
  const location = useLocation();

  useEffect(() => {
    const origin = getOnboardingBaseUrl();
    const target = `${origin}${location.pathname}${location.search}`;
    window.location.replace(target);
  }, [location]);

  return (
    <div style={{padding: 48, textAlign: 'center', color: '#6b7280'}}>
      Opening receiver onboarding…
    </div>
  );
}
