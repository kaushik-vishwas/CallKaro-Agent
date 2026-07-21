import type {HTMLAttributes, ReactNode} from 'react';
import styles from './Card.module.css';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
};

export function Card({
  children,
  padding = 'md',
  elevated = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        styles.card,
        styles[`pad_${padding}`],
        elevated ? styles.elevated : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
