import type {LucideIcon} from 'lucide-react';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Share2,
  BarChart3,
  UserRound,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  {id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard},
  {id: 'add-receiver', label: 'Add Receiver', path: '/add-receiver', icon: UserPlus},
  {id: 'receivers', label: 'Receivers', path: '/receivers', icon: Users},
  {
    id: 'share-credentials',
    label: 'Share Credentials',
    path: '/share-credentials',
    icon: Share2,
  },
  {id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart3},
  {id: 'profile', label: 'Profile', path: '/profile', icon: UserRound},
];

export const CURRENT_AGENT = {
  name: 'Agent User',
  email: 'agent@callkaro.com',
};
