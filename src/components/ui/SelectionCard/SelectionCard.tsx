import type {ReactNode} from 'react';
import styles from './SelectionCard.module.css';

export type SelectionCardOption = {
  value: string;
  title: string;
  subtitle?: string;
};

type SelectionCardGroupProps = {
  label?: string;
  labelIcon?: ReactNode;
  options: SelectionCardOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  name?: string;
};

export function SelectionCardGroup({
  label,
  labelIcon,
  options,
  value,
  onChange,
  error,
  name = 'selection',
}: SelectionCardGroupProps) {
  return (
    <fieldset className={styles.fieldset}>
      {label ? (
        <legend className={styles.label}>
          {labelIcon ? <span className={styles.labelIcon}>{labelIcon}</span> : null}
          {label}
        </legend>
      ) : null}
      <div className={styles.grid} role="radiogroup" aria-label={label ?? name}>
        {options.map(option => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={[styles.card, selected ? styles.selected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(option.value)}
            >
              <span className={styles.title}>{option.title}</span>
              {option.subtitle ? (
                <span className={styles.subtitle}>{option.subtitle}</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {error ? <span className={styles.error}>{error}</span> : null}
    </fieldset>
  );
}
