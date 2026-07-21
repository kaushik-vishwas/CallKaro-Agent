import type {ReactNode} from 'react';
import styles from './Badge.module.css';

export type BadgeTone =
  | 'level1'
  | 'level2'
  | 'level3'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'pending'
  | 'pink';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({children, tone = 'neutral', className = ''}: BadgeProps) {
  return (
    <span className={[styles.badge, styles[tone], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
