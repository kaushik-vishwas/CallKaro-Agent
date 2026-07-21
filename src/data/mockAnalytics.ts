import type {LucideIcon} from 'lucide-react';
import {
  Activity,
  Clock3,
  Phone,
  ShieldCheck,
  TimerReset,
  Users,
} from 'lucide-react';
import type {ReceiverListItem} from './mockReceivers';

export type AnalyticsStat = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
};

export const ANALYTICS_STATS: AnalyticsStat[] = [
  {id: 'total', label: 'Total Receivers', value: '124', icon: Users},
  {id: 'pending', label: 'Pending Profiles', value: '8', icon: Clock3},
  {id: 'approved', label: 'Approved Receivers', value: '96', icon: ShieldCheck},
  {id: 'active', label: 'Active Receivers', value: '87', icon: Activity},
  {id: 'calls', label: 'Total Calls', value: '450', icon: Phone},
  {id: 'hours', label: 'Call Hours', value: '45,230', icon: TimerReset},
];

export const MONTHLY_TREND = [
  {month: 'Jan', value: 28},
  {month: 'Feb', value: 36},
  {month: 'Mar', value: 44},
  {month: 'Apr', value: 62},
  {month: 'May', value: 48},
  {month: 'Jun', value: 55},
  {month: 'Jul', value: 78},
  {month: 'Aug', value: 58},
  {month: 'Sep', value: 64},
  {month: 'Oct', value: 82},
  {month: 'Nov', value: 70},
  {month: 'Dec', value: 94},
];

export const TOP_PERFORMERS: ReceiverListItem[] = [
  {
    id: 'RCV-100',
    name: 'Priya Sharma',
    level: 2,
    status: 'Active',
    totalHours: 142,
    earnings: 24580,
  },
  {
    id: 'RCV-200',
    name: 'Ananya Patel',
    level: 3,
    status: 'Active',
    totalHours: 198,
    earnings: 38230,
  },
  {
    id: 'RCV-400',
    name: 'Meera Singh',
    level: 2,
    status: 'Active',
    totalHours: 156,
    earnings: 28900,
  },
];
