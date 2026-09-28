import React from 'react';
import type { Balance } from '../../domain/Balance';
import type { Order } from '../../domain/Order';
import type { Trade } from '../../domain/Trade';
import type { Column } from './FooterTable';
import { formatAmount, formatTime } from './format';
import { side } from './styles';

function renderSide(value: 'buy' | 'sell') {
  return <span className={side({ side: value })}>{value}</span>;
}

export const BALANCE_COLUMNS: Column<Balance>[] = [
  { label: 'Asset', render: (b) => b.asset },
  { label: 'Balance', numeric: true, render: (b) => formatAmount(b.balance) },
];

export const ORDER_COLUMNS: Column<Order>[] = [
  { label: 'Time', render: (o) => formatTime(o.createdAt) },
  { label: 'Market', render: (o) => o.symbol },
  { label: 'Side', render: (o) => renderSide(o.side) },
  {
    label: 'Type',
    render: (o) => <span className="capitalize">{o.type}</span>,
  },
  {
    label: 'Price',
    numeric: true,
    render: (o) =>
      o.limitPrice === null ? 'Market' : formatAmount(o.limitPrice),
  },
  { label: 'Amount', numeric: true, render: (o) => formatAmount(o.quantity) },
  { label: 'Filled', numeric: true, render: (o) => formatAmount(o.filled) },
];

export const TRADE_COLUMNS: Column<Trade>[] = [
  { label: 'Time', render: (t) => formatTime(t.time) },
  { label: 'Market', render: (t) => t.symbol },
  { label: 'Side', render: (t) => renderSide(t.side) },
  { label: 'Price', numeric: true, render: (t) => formatAmount(t.price) },
  { label: 'Amount', numeric: true, render: (t) => formatAmount(t.quantity) },
  { label: 'Cost', numeric: true, render: (t) => formatAmount(t.cost) },
  {
    label: 'Fee',
    numeric: true,
    render: (t) =>
      t.fee ? `${formatAmount(t.fee.amount)} ${t.fee.asset}` : '—',
  },
];
