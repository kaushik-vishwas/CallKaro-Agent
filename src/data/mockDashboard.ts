import type {BadgeTone} from '../components/ui';

export type StatTone = 'blue' | 'amber' | 'green' | 'violet' | 'rose';

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  tone: StatTone;
  icon: 'users' | 'clock' | 'check' | 'zap' | 'dollar';
};

export type QuickAction = {
  id: string;
  title: string;
  description: string;
  variant: 'primary' | 'outline';
  icon: 'plus' | 'link' | 'eye';
  path: string;
};

export type ActivityItem = {
  id: string;
  name: string;
  action: string;
  level: number;
  timeAgo: string;
};

export type PendingApproval = {
  id: string;
  name: string;
  photos: number;
  kyc: 'Complete' | 'Pending';
  level: number;
  timeAgo: string;
};

export function levelTone(level: number): BadgeTone {
  if (level <= 1) return 'level1';
  if (level === 2) return 'level2';
  return 'level3';
}

export const DASHBOARD_STATS: DashboardStat[] = [
  {id: 'total', label: 'Total Receivers', value: '124', tone: 'blue', icon: 'users'},
  {id: 'pending', label: 'Pending Profiles', value: '8', tone: 'amber', icon: 'clock'},
  {id: 'approved', label: 'Approved Receivers', value: '96', tone: 'green', icon: 'check'},
  {id: 'active', label: 'Active Receivers', value: '87', tone: 'violet', icon: 'zap'},
  {id: 'revenue', label: 'Revenue Generated', value: '45,230', tone: 'rose', icon: 'dollar'},
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'create',
    title: 'Create Receiver',
    description: 'Add new receiver profile',
    variant: 'primary',
    icon: 'plus',
    path: '/add-receiver',
  },
  {
    id: 'link',
    title: 'Generate Link',
    description: 'Create onboarding link',
    variant: 'outline',
    icon: 'link',
    path: '/share-credentials',
  },
  {
    id: 'receivers',
    title: 'View Receivers',
    description: 'Manage your receiver list',
    variant: 'outline',
    icon: 'eye',
    path: '/receivers',
  },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    name: 'Priya Sharma',
    action: 'Profile submitted for approval',
    level: 2,
    timeAgo: '5 min ago',
  },
  {
    id: 'a2',
    name: 'Ananya Patel',
    action: 'KYC documents uploaded',
    level: 1,
    timeAgo: '22 min ago',
  },
  {
    id: 'a3',
    name: 'Sneha Reddy',
    action: 'Profile approved',
    level: 3,
    timeAgo: '1 hour ago',
  },
  {
    id: 'a4',
    name: 'Meera Joshi',
    action: 'Photos updated',
    level: 2,
    timeAgo: '3 hours ago',
  },
];

export const PENDING_APPROVALS: PendingApproval[] = [
  {
    id: 'p1',
    name: 'Riya Verma',
    photos: 5,
    kyc: 'Complete',
    level: 2,
    timeAgo: '2 hours ago',
  },
  {
    id: 'p2',
    name: 'Kavya Nair',
    photos: 4,
    kyc: 'Pending',
    level: 1,
    timeAgo: '5 hours ago',
  },
  {
    id: 'p3',
    name: 'Isha Kapoor',
    photos: 6,
    kyc: 'Complete',
    level: 3,
    timeAgo: '1 day ago',
  },
];
