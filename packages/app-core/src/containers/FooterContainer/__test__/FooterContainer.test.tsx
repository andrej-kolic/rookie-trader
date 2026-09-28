import React from 'react';
import { Subject } from 'rxjs';
import { act, render, screen } from '@testing-library/react';
import { FooterContainer } from '..';
import { useAuthStore } from '../../../state/auth-store';

const balances$ = new Subject<unknown>();

// Balances arrive over the private Kraken WebSocket
jest.mock('../../../api/kraken-ws-api', () => ({
  subscribeToBalances: () => balances$,
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
  useAuthStore.setState({ session: null, isAuthenticated: false });
});

describe('FooterContainer balances', () => {
  it('asksToLogIn_whenNotAuthenticated', () => {
    render(<FooterContainer />);

    expect(screen.getByText('Please login to view balances')).toBeTruthy();
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
