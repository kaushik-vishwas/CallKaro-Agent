import styles from './EmptyTableState.module.css';

type EmptyTableStateProps = {
  label?: string;
};

export function EmptyTableState({
  label = 'No data found',
}: EmptyTableStateProps) {
  return (
    <div className={styles.wrap} role="status">
      <img
        src="/images/empty-search.png"
        alt=""
        className={styles.illustration}
        width={160}
        height={140}
      />
      <p className={styles.label}>{label}</p>
    </div>
  );
}
