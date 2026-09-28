import {
  applyExecutions,
  EMPTY_EXECUTIONS,
  MAX_TRADES,
} from '../execution-mapper';

type Report = Parameters<typeof applyExecutions>[1]['data'][0];

const update = (data: Report[]) => ({ type: 'update' as const, data });
const snapshot = (data: Report[]) => ({ type: 'snapshot' as const, data });

function openOrder(id: string): Report {
  return {
    exec_type: 'new',
    order_id: id,
    symbol: 'BTC/USD',
    side: 'buy',
    order_type: 'limit',
    limit_price: 50000,
    order_qty: 2,
    cum_qty: 0,
    order_status: 'new',
    timestamp: '2026-09-28T10:00:00Z',
  };
}

function fill(
  execId: string,
  qty: number,
  status: 'partially_filled' | 'filled',
  time: string,
): Report {
  return {
    exec_type: 'trade',
    exec_id: execId,
    order_id: 'O1',
    symbol: 'BTC/USD',
    side: 'buy',
    last_price: 50000,
    last_qty: qty,
    cost: 50000 * qty,
    fees: [{ asset: 'USD', qty: 10 }],
    cum_qty: qty,
    order_status: status,
    timestamp: time,
  };
}

const withO1 = applyExecutions(EMPTY_EXECUTIONS, update([openOrder('O1')]));

describe('applyExecutions', () => {
  it('addsOpenOrder_whenNewOrderReported', () => {
    const order = withO1.orders.get('O1');

    expect(order?.limitPrice).toBe(50000);
    expect(order?.quantity).toBe(2);
    expect(order?.status).toBe('new');
  });

  it('updatesFilledAndRecordsTrade_whenOrderPartiallyFilled', () => {
    const state = applyExecutions(
      withO1,
      update([fill('T1', 0.5, 'partially_filled', '2026-09-28T10:01:00Z')]),
    );

    expect(state.orders.get('O1')?.filled).toBe(0.5);
    expect(state.orders.get('O1')?.status).toBe('partially_filled');
    expect(state.trades).toHaveLength(1);
    expect(state.trades[0]?.fee).toEqual({ asset: 'USD', amount: 10 });
  });

  it('removesOrder_whenFullyFilled', () => {
    const state = applyExecutions(
      withO1,
      update([fill('T1', 2, 'filled', '2026-09-28T10:01:00Z')]),
    );

    expect(state.orders.size).toBe(0);
    expect(state.trades).toHaveLength(1);
  });

  it('removesOrder_whenCancelReportCarriesOnlyStatus', () => {
    const state = applyExecutions(
      withO1,
      update([
        { exec_type: 'canceled', order_id: 'O1', order_status: 'canceled' },
      ]),
    );

    expect(state.orders.size).toBe(0);
  });

  it('updatesPriceAndAmount_whenOrderAmended', () => {
    // Kraken sends exec_type "amended", which ts-kraken's types don't list yet
    const state = applyExecutions(
      withO1,
      update([{ order_id: 'O1', limit_price: 49000, order_qty: 3 }]),
    );

    expect(state.orders.get('O1')?.limitPrice).toBe(49000);
    expect(state.orders.get('O1')?.quantity).toBe(3);
    expect(state.orders.get('O1')?.status).toBe('new');
  });

  it('ignoresReport_whenOrderUnknownAndIncomplete', () => {
    const state = applyExecutions(
      EMPTY_EXECUTIONS,
      update([{ exec_type: 'restated', order_id: 'O9', order_status: 'new' }]),
    );

    expect(state.orders.size).toBe(0);
  });

  it('dropsOrdersClosedWhileDisconnected_whenSnapshotArrives', () => {
    const before = applyExecutions(withO1, update([openOrder('O2')]));

    const state = applyExecutions(before, snapshot([openOrder('O2')]));

    expect([...state.orders.keys()]).toEqual(['O2']);
  });

  it('keepsTradesNewestFirstWithoutDuplicates_whenSnapshotRepeats', () => {
    const fills = snapshot([
      fill('T1', 1, 'filled', '2026-09-28T10:01:00Z'),
      fill('T2', 1, 'filled', '2026-09-28T10:05:00Z'),
    ]);
    const once = applyExecutions(EMPTY_EXECUTIONS, fills);

    const twice = applyExecutions(once, fills);

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

    const state = applyExecutions(EMPTY_EXECUTIONS, update(fills));

    expect(state.trades).toHaveLength(MAX_TRADES);
    expect(state.trades[0]?.id).toBe(`T${MAX_TRADES + 4}`);
  });
});
