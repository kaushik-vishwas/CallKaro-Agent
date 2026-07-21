import type {ReactNode} from 'react';
import styles from './Table.module.css';

export type TableColumn<T> = {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
};

export function Table<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  if (rows.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} style={column.width ? {width: column.width} : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={rowKey(row)}>
              {columns.map(column => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
