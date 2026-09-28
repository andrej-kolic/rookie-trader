import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

function renderLoginForm() {
  const onClose = jest.fn();
  render(
    <LoginForm
      onSubmit={jest.fn()}
      onClose={onClose}
      isLoading={false}
      error={null}
    />,
  );
  return onClose;
}

describe('LoginForm dialog', () => {
  it('closes_whenEscapePressed', async () => {
    const user = userEvent.setup();
    const onClose = renderLoginForm();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes_whenBackdropClicked', async () => {
    const user = userEvent.setup();
    const onClose = renderLoginForm();

    await user.click(screen.getByRole('dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('staysOpen_whenClickedInsideCard', async () => {
    const user = userEvent.setup();
    const onClose = renderLoginForm();

    await user.click(screen.getByLabelText('API Key'));

    expect(onClose).not.toHaveBeenCalled();
  });
});
