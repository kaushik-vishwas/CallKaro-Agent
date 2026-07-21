import type {InputHTMLAttributes, ReactNode} from 'react';
import styles from './Input.module.css';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelIcon?: ReactNode;
  rightAdornment?: ReactNode;
  error?: string;
  hint?: string;
};

export function Input({
  label,
  labelIcon,
  rightAdornment,
  error,
  hint,
  id,
  className = '',
  ...rest
}: InputProps) {
  const inputId = id ?? rest.name;

  return (
    <label className={styles.field} htmlFor={inputId}>
      {label ? (
        <span className={styles.label}>
          {labelIcon ? <span className={styles.labelIcon}>{labelIcon}</span> : null}
          {label}
        </span>
      ) : null}
      <div className={styles.control}>
        <input
          id={inputId}
          className={[
            styles.input,
            rightAdornment ? styles.withRight : '',
            error ? styles.invalid : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={Boolean(error)}
          {...rest}
        />
        {rightAdornment ? (
          <span className={styles.rightAdornment}>{rightAdornment}</span>
        ) : null}
      </div>
      {error ? <span className={styles.error}>{error}</span> : null}
      {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}
