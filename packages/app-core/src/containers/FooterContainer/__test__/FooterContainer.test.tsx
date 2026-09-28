import React from 'react';
import { Subject } from 'rxjs';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FooterContainer } from '..';
import { useAuthStore } from '../../../state/auth-store';

const balances$ = new Subject<unknown>();
const executions$ = new Subject<unknown>();

// Account data arrives over the private Kraken WebSocket
jest.mock('../../../api/kraken-ws-api', () => ({
  subscribeToBalances: () => balances$,
  subscribeToExecutions: () => executions$,
}));

// Login goes over HTTP; these tests start from a stored session instead
jest.mock('../../../api/auth-api', () => ({}));

function signIn() {
  localStorage.setItem(
    'kraken_auth_session',
    JSON.stringify({ token: 'token', createdAt: Date.now() }),
  );
}

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    session: null,
    isAuthenticated: false,
    isLoading: false,
  });
});

describe('FooterContainer balances', () => {
  it('asksToLogIn_whenNotAuthenticated', () => {
    render(<FooterContainer />);

    expect(screen.getByText('Please login to view your account')).toBeTruthy();
  });

  it('showsLoadingPlaceholder_whenSignInInProgress', () => {
    render(<FooterContainer />);

    act(() => {
      useAuthStore.setState({ isLoading: true });
    });

    expect(
      screen.getByRole('status', { name: 'Loading account' }),
    ).toBeTruthy();
  });

  it('showsLoadingPlaceholder_whenNoBalancesReceivedYet', () => {
    signIn();

    render(<FooterContainer />);

    expect(
      screen.getByRole('status', { name: 'Loading balances' }),
    ).toBeTruthy();
  });

  it('listsBalances_whenUpdateArrives', () => {
    signIn();
    render(<FooterContainer />);

    act(() => {
      balances$.next({ data: [{ asset: 'BTC', balance: 1.5 }] });
    });

    expect(screen.getByRole('cell', { name: 'BTC' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: '1.5' })).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('FooterContainer orders and trades', () => {
  const ORDER = {
    exec_type: 'new',
    order_id: 'O1',
    symbol: 'ETH/USD',
    side: 'sell',
    order_type: 'limit',
    limit_price: 4000,
    order_qty: 3,
    cum_qty: 0,
    order_status: 'new',
    timestamp: '2026-09-28T10:00:00Z',
  };

  it('listsOpenOrder_whenOrdersTabOpenedAfterSnapshot', async () => {
    signIn();
    const user = userEvent.setup();
    render(<FooterContainer />);

    act(() => {
      executions$.next({ type: 'snapshot', data: [ORDER] });
    });
    await user.click(screen.getByRole('button', { name: 'Open orders' }));

    expect(screen.getByRole('cell', { name: 'ETH/USD' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'sell' })).toBeTruthy();
  });

  it('movesFillToTrades_whenOrderFilled', async () => {
    signIn();
    const user = userEvent.setup();
    render(<FooterContainer />);

    act(() => {
      executions$.next({ type: 'snapshot', data: [ORDER] });
      executions$.next({
        type: 'update',
        data: [
          {
            ...ORDER,
            exec_type: 'trade',
            exec_id: 'T1',
            last_price: 4000,
            last_qty: 3,
            cost: 12000,
            fees: [{ asset: 'USD', qty: 4.8 }],
            cum_qty: 3,
            order_status: 'filled',
          },
        ],
      });
    });

    await user.click(screen.getByRole('button', { name: 'Open orders' }));
    expect(screen.getByText('No open orders')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Trades' }));
    expect(screen.getByRole('cell', { name: '4.8 USD' })).toBeTruthy();
  });
});
