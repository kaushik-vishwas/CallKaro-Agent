import type {ButtonHTMLAttributes, ReactNode} from 'react';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'muted'
  | 'whatsapp'
  | 'soft'
  | 'danger'
  | 'dangerSolid'
  | 'warning'
  | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className={styles.icon}>{rightIcon}</span> : null}
    </button>
  );
}
