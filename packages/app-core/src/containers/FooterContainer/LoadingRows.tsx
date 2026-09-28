import React from 'react';
import { footerTable } from './styles';

/** Placeholder bars shown while a footer tab waits for data */
export function LoadingRows({ label }: { label: string }) {
  const s = footerTable();
  return (
    <div className={s.skeletonGrid()} role="status" aria-label={label}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={s.skeletonRow()}>
          <div className={s.skeletonShort()}></div>
          <div className={s.skeletonLong()}></div>
        </div>
      ))}
    </div>
  );
}
