import type {ReactNode, SelectHTMLAttributes} from 'react';
import styles from './Select.module.css';

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  labelIcon?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

export function Select({
  label,
  labelIcon,
  options,
  placeholder = 'Select',
  error,
  id,
  className = '',
  value,
  ...rest
}: SelectProps) {
  const selectId = id ?? rest.name;
  const isEmpty = value === undefined || value === '';

  return (
    <label className={styles.field} htmlFor={selectId}>
      {label ? (
        <span className={styles.label}>
          {labelIcon ? <span className={styles.labelIcon}>{labelIcon}</span> : null}
          {label}
        </span>
      ) : null}
      <div className={styles.wrap}>
        <select
          id={selectId}
          className={[
            styles.select,
            isEmpty ? styles.placeholder : '',
            error ? styles.invalid : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          value={value}
          aria-invalid={Boolean(error)}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
