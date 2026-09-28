import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SystemStatus } from '..';

function renderStatus(status: string) {
  render(
    <div>
      <SystemStatus status={status} />
      <p>Outside</p>
    </div>,
  );
  return screen.getByRole('button', { name: /online|cancel only/i });
}

describe('SystemStatus legend', () => {
  it('showsEveryStatus_whenPillClicked', async () => {
    const user = userEvent.setup();
    await user.click(renderStatus('online'));

    const legend = screen.getByRole('dialog', { name: 'Exchange status' });
    const labels = Array.from(legend.querySelectorAll('li')).map(
      (li) => li.textContent,
    );
    expect(labels).toHaveLength(6);
    for (const name of [
      'online',
      'post only',
      'limit only',
      'cancel only',
      'maintenance',
      'offline',
    ]) {
      expect(labels.some((text) => text.startsWith(name))).toBe(true);
    }
  });

  it('marksCurrentStatus_inLegend', async () => {
    const user = userEvent.setup();
    await user.click(renderStatus('cancel_only'));

    const current = screen
      .getByRole('dialog')
      .querySelector('[aria-current="true"]');
    expect(current?.textContent).toMatch(/^cancel only/);
  });

  it('closesLegend_whenClickedOutside', async () => {
    const user = userEvent.setup();
    await user.click(renderStatus('online'));

    await user.click(screen.getByText('Outside'));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closesLegend_whenEscapePressed', async () => {
    const user = userEvent.setup();
    await user.click(renderStatus('online'));

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
