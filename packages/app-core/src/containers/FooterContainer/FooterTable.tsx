import React from 'react';
import { footer, footerTable } from './styles';

export type Column<Row> = {
  label: string;
  numeric?: boolean;
  render: (row: Row) => React.ReactNode;
};

type FooterTableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  loading: boolean;
  loadingLabel: string;
  error: Error | null;
  emptyMessage: string;
};

/** Table for a footer tab, with its loading, error and empty states */
export function FooterTable<Row>({
  columns,
  rows,
  rowKey,
  loading,
  loadingLabel,
  error,
  emptyMessage,
}: FooterTableProps<Row>) {
  const f = footer();
  const s = footerTable();

  if (loading) {
    return (
      <div className={s.skeletonGrid()} role="status" aria-label={loadingLabel}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={s.skeletonRow()}>
            <div className={s.skeletonShort()}></div>
            <div className={s.skeletonLong()}></div>
          </div>
        ))}
      </div>
    );
  }
  if (error) return <div className={f.error()}>Error: {error.message}</div>;
  if (rows.length === 0) {
    return <div className={f.message()}>{emptyMessage}</div>;
  }

  return (
    <table className={s.table()}>
      <thead>
        <tr>
          {columns.map(({ label, numeric }) => (
            <th key={label} className={s.headCell({ numeric })}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className={s.row()}>
            {columns.map(({ label, numeric, render }) => (
              <td key={label} className={s.cell({ numeric })}>
                {render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
