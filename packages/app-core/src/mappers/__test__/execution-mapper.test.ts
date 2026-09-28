import {
  applyExecutions,
  EMPTY_EXECUTIONS,
  MAX_TRADES,
} from '../execution-mapper';

const NEW_ORDER = {
  exec_type: 'new' as const,
  order_id: 'O1',
  symbol: 'BTC/USD',
  side: 'buy' as const,
  order_type: 'limit' as const,
  limit_price: 50000,
  order_qty: 2,
  cum_qty: 0,
  order_status: 'new' as const,
  timestamp: '2026-09-28T10:00:00Z',
};

function fill(
  execId: string,
  qty: number,
  status: 'partially_filled' | 'filled',
  time: string,
) {
  return {
    exec_type: 'trade' as const,
    exec_id: execId,
    order_id: 'O1',
    symbol: 'BTC/USD',
    side: 'buy' as const,
    last_price: 50000,
    last_qty: qty,
    cost: 50000 * qty,
    fees: [{ asset: 'USD', qty: 10 }] as [{ asset: string; qty: number }],
    cum_qty: qty,
    order_status: status,
    timestamp: time,
  };
}

describe('applyExecutions', () => {
  it('addsOpenOrder_whenNewOrderReported', () => {
    const state = applyExecutions(EMPTY_EXECUTIONS, [NEW_ORDER]);

    const order = state.orders.get('O1');
    expect(order?.limitPrice).toBe(50000);
    expect(order?.quantity).toBe(2);
    expect(order?.status).toBe('new');
  });

  it('updatesFilledAndRecordsTrade_whenOrderPartiallyFilled', () => {
    const open = applyExecutions(EMPTY_EXECUTIONS, [NEW_ORDER]);

    const state = applyExecutions(open, [
      fill('T1', 0.5, 'partially_filled', '2026-09-28T10:01:00Z'),
    ]);

    expect(state.orders.get('O1')?.filled).toBe(0.5);
    expect(state.orders.get('O1')?.status).toBe('partially_filled');
    expect(state.trades).toHaveLength(1);
    expect(state.trades[0]?.fee).toEqual({ asset: 'USD', amount: 10 });
  });

  it('removesOrder_whenFullyFilled', () => {
    const open = applyExecutions(EMPTY_EXECUTIONS, [NEW_ORDER]);

    const state = applyExecutions(open, [
      fill('T1', 2, 'filled', '2026-09-28T10:01:00Z'),
    ]);

    expect(state.orders.size).toBe(0);
    expect(state.trades).toHaveLength(1);
  });

  it('removesOrder_whenCancelReportCarriesOnlyStatus', () => {
    const open = applyExecutions(EMPTY_EXECUTIONS, [NEW_ORDER]);

    const state = applyExecutions(open, [
      { exec_type: 'canceled', order_id: 'O1', order_status: 'canceled' },
    ]);

    expect(state.orders.size).toBe(0);
  });

  it('ignoresReport_whenOrderUnknownAndIncomplete', () => {
    const state = applyExecutions(EMPTY_EXECUTIONS, [
      { exec_type: 'restated', order_id: 'O9', order_status: 'new' },
    ]);

    expect(state.orders.size).toBe(0);
  });

  it('keepsTradesNewestFirstWithoutDuplicates_whenSnapshotRepeats', () => {
    const snapshot = [
      fill('T1', 1, 'filled', '2026-09-28T10:01:00Z'),
      fill('T2', 1, 'filled', '2026-09-28T10:05:00Z'),
    ];
    const once = applyExecutions(EMPTY_EXECUTIONS, snapshot);

    const twice = applyExecutions(once, snapshot);

    expect(twice.trades.map((t) => t.id)).toEqual(['T2', 'T1']);
  });

  it('capsTradeHistory_whenMoreFillsThanLimitArrive', () => {
    const fills = Array.from({ length: MAX_TRADES + 5 }, (_, i) =>
      fill(
        `T${i}`,
        1,
        'filled',
        new Date(Date.UTC(2026, 8, 28, 0, i)).toISOString(),
      ),
    );

    const state = applyExecutions(EMPTY_EXECUTIONS, fills);

    expect(state.trades).toHaveLength(MAX_TRADES);
    expect(state.trades[0]?.id).toBe(`T${MAX_TRADES + 4}`);
  });
});
