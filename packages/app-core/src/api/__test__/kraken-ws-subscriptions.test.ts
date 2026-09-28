import { NEVER } from 'rxjs';
import { subscribeToOrderBook, subscribeToTicker } from '../kraken-ws-api';

// No real socket: every Kraken stream stays silent
jest.mock('ts-kraken', () => ({
  publicWsSubscription: () => NEVER,
  privateWsSubscription: () => NEVER,
  publicWsStatus$: NEVER,
  publicWsConnected$: NEVER,
  publicWsDisconnected$: NEVER,
  publicWsHeartbeat$: NEVER,
}));
// The HTTP token endpoint is only needed for private streams
jest.mock('../auth-api', () => ({}));

describe('kraken-ws-api subscriptions', () => {
  it('leavesCallerSymbolsInOrder_whenSubscribingToTicker', () => {
    const symbols = ['XBT/USD', 'ETH/USD'];

    subscribeToTicker(symbols);

    expect(symbols).toEqual(['XBT/USD', 'ETH/USD']);
  });

  it('leavesCallerSymbolsInOrder_whenSubscribingToOrderBook', () => {
    const symbols = ['XBT/USD', 'ETH/USD'];

    subscribeToOrderBook(symbols, 10);

    expect(symbols).toEqual(['XBT/USD', 'ETH/USD']);
  });
});
