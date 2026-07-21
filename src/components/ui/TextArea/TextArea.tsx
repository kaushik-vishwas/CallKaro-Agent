import type {TextareaHTMLAttributes} from 'react';
import styles from './TextArea.module.css';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function TextArea({
  label,
  error,
  hint,
  id,
  className = '',
  rows = 4,
  ...rest
}: TextAreaProps) {
  const areaId = id ?? rest.name;

  return (
    <label className={styles.field} htmlFor={areaId}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea
        id={areaId}
        rows={rows}
        className={[styles.textarea, error ? styles.invalid : '', className]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? <span className={styles.error}>{error}</span> : null}
      {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}
