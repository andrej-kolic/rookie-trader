import React from 'react';
import { Subject } from 'rxjs';
import { act, render } from '@testing-library/react';
import { SystemStatusContainer } from '..';

const status$ = new Subject<unknown>();

// Status arrives over the public Kraken WebSocket
jest.mock('../../../api/kraken-ws-api', () => ({
  subscribeToStatus: () => status$,
}));

describe('SystemStatusContainer', () => {
  it('logsStatusErrorOnce_acrossRerenders', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const { rerender } = render(<SystemStatusContainer />);

    act(() => {
      status$.error(new Error('socket closed'));
    });
    rerender(<SystemStatusContainer />);
    rerender(<SystemStatusContainer />);

    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
