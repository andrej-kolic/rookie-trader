import { concat, NEVER, of } from 'rxjs';
import * as Kraken from 'ts-kraken';
import { resetWsToken, subscribeToExecutions } from '../kraken-ws-api';

// The Kraken WebSocket and the HTTP token endpoint are the network boundary
jest.mock('ts-kraken', () => ({
  privateWsSubscription: jest.fn(),
  publicWsSubscription: () => NEVER,
}));
const mockGetWsToken = jest.fn();
jest.mock('../auth-api', () => ({
  getWsToken: () => mockGetWsToken() as Promise<string>,
}));

const subscribe = jest.mocked(Kraken.privateWsSubscription);

beforeEach(() => {
  mockGetWsToken
    .mockResolvedValueOnce('ws-token-1')
    .mockResolvedValueOnce('ws-token-2');
  jest.useFakeTimers();
  resetWsToken();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('subscribeToExecutions', () => {
  it('resubscribes_whenSocketClosesCleanly', async () => {
    subscribe
      // First connection: one message, then a clean close (stream completes)
      .mockResolvedValueOnce(of('first') as never)
      .mockResolvedValueOnce(concat(of('second'), NEVER) as never);
    const received: unknown[] = [];

    const subscription = subscribeToExecutions(() => 'auth-token').subscribe(
      (message) => received.push(message),
    );
    await jest.advanceTimersByTimeAsync(5000);
    subscription.unsubscribe();

    expect(received).toEqual(['first', 'second']);
    expect(subscribe).toHaveBeenCalledTimes(2);
  });

  it('usesFreshToken_whenReconnecting', async () => {
    subscribe
      .mockResolvedValueOnce(of('first') as never)
      .mockResolvedValueOnce(NEVER);

    const subscription = subscribeToExecutions(() => 'auth-token').subscribe();
    await jest.advanceTimersByTimeAsync(5000);
    subscription.unsubscribe();

    expect(subscribe.mock.calls.map(([, token]) => token)).toEqual([
      'ws-token-1',
      'ws-token-2',
    ]);
  });

  it('usesFreshToken_whenKrakenRejectsSubscription', async () => {
    subscribe
      .mockRejectedValueOnce(
        'Method subscribe returned error: EAccount:Invalid token',
      )
      .mockResolvedValueOnce(NEVER);

    const subscription = subscribeToExecutions(() => 'auth-token').subscribe();
    await jest.advanceTimersByTimeAsync(5000);
    subscription.unsubscribe();

    expect(subscribe.mock.calls.map(([, token]) => token)).toEqual([
      'ws-token-1',
      'ws-token-2',
    ]);
  });
});
