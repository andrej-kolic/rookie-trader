import { concat, NEVER, of } from 'rxjs';
import * as Kraken from 'ts-kraken';
import { resetWsToken, subscribeToExecutions } from '../kraken-ws-api';

// The Kraken WebSocket and the HTTP token endpoint are the network boundary
jest.mock('ts-kraken', () => ({
  privateWsSubscription: jest.fn(),
  publicWsSubscription: () => NEVER,
}));
jest.mock('../auth-api', () => ({
  getWsToken: () => Promise.resolve('ws-token'),
}));

const subscribe = jest.mocked(Kraken.privateWsSubscription);

beforeEach(() => {
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
});
