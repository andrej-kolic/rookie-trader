import React from 'react';
import { NEVER } from 'rxjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '..';

// The status indicator in the header subscribes to the Kraken WebSocket
jest.mock('../../../api/kraken-ws-api', () => ({
  subscribeToStatus: () => NEVER,
}));

function renderAuthenticatedHeader() {
  render(
    <div>
      <Header title="Rookie" isAuthenticated />
      <p>Outside</p>
    </div>,
  );
  return screen.getByTitle(/click to disconnect/);
}

describe('Header disconnect menu', () => {
  it('closesMenu_whenClickedOutside', async () => {
    const user = userEvent.setup();
    await user.click(renderAuthenticatedHeader());
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeTruthy();

    await user.click(screen.getByText('Outside'));

    expect(screen.queryByRole('button', { name: 'Disconnect' })).toBeNull();
  });

  it('keepsMenuOpen_whenClickedInsideMenu', async () => {
    const user = userEvent.setup();
    await user.click(renderAuthenticatedHeader());

    await user.click(screen.getByText('✓ Connected to Kraken'));

    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeTruthy();
  });

  it('closesMenu_whenToggleClickedAgain', async () => {
    const user = userEvent.setup();
    const toggle = renderAuthenticatedHeader();
    await user.click(toggle);

    await user.click(toggle);

    expect(screen.queryByRole('button', { name: 'Disconnect' })).toBeNull();
  });
});
