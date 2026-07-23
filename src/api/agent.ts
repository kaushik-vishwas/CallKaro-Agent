import {apiRequest} from './client';
import {toClientOnboardingLink} from '../config/env';
import type {
  ReceiverCredentials,
  ReceiverListItem,
  ReceiverProfile,
  ReceiverStatus,
} from '../data/mockReceivers';

export type Agent = {
  id: string;
  email: string;
  name: string;
  phone: string;
  agentCode: string;
  avatarUrl: string;
};

export type ReceiverStats = {
  total: number;
  active: number;
  totalCalls: number;
  totalEarnings: number;
  stats: Array<{id: string; label: string; value: string}>;
};

export type CreatedReceiverResult = {
  receiver: ReceiverProfile & {statusKey?: string; onboardingLink?: string};
  onboardingLink: string;
};

export async function loginAgent(email: string, password: string) {
  return apiRequest<{token: string; agent: Agent}>('/agent/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });
}

export async function fetchAgentMe() {
  return apiRequest<{agent: Agent}>('/agent/me');
}

export async function updateAgentProfile(payload: {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}) {
  return apiRequest<{agent: Agent}>('/agent/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateAgentPassword(
  currentPassword: string,
  newPassword: string,
) {
  return apiRequest<Record<string, never>>('/agent/update-password', {
    method: 'POST',
    body: JSON.stringify({currentPassword, newPassword}),
  });
}

export async function createReceiver(payload: {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  level: number;
  asDraft?: boolean;
}) {
  const result = await apiRequest<CreatedReceiverResult>('/agent/receivers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const onboardingLink = toClientOnboardingLink(result.onboardingLink);
  return {
    ...result,
    onboardingLink,
    receiver: {
      ...result.receiver,
      onboardingLink,
    },
  };
}

export async function listReceivers(params?: {
  status?: ReceiverStatus | 'All';
  q?: string;
}) {
  const search = new URLSearchParams();
  if (params?.status && params.status !== 'All') {
    search.set('status', params.status);
  }
  if (params?.q) search.set('q', params.q);
  const qs = search.toString();
  return apiRequest<{receivers: ReceiverListItem[]}>(
    `/agent/receivers${qs ? `?${qs}` : ''}`,
  );
}

export async function fetchReceiverStats() {
  return apiRequest<ReceiverStats>('/agent/receivers/stats');
}

export async function fetchReceiver(id: string) {
  const result = await apiRequest<{
    receiver: ReceiverProfile & {onboardingLink?: string};
  }>(`/agent/receivers/${id}`);

  if (result.receiver?.onboardingLink) {
    return {
      ...result,
      receiver: {
        ...result.receiver,
        onboardingLink: toClientOnboardingLink(result.receiver.onboardingLink),
      },
    };
  }
  return result;
}

export async function listCredentialReceivers() {
  return apiRequest<{receivers: ReceiverListItem[]}>(
    '/agent/receivers/credentials',
  );
}

export async function fetchReceiverCredentials(id: string) {
  return apiRequest<ReceiverCredentials & {id: string; name: string}>(
    `/agent/receivers/${id}/credentials`,
  );
}

export async function submitReceiverForReview(id: string) {
  return apiRequest<{receiver: ReceiverProfile}>(
    `/agent/receivers/${id}/submit-for-review`,
    {method: 'POST', body: JSON.stringify({})},
  );
}
