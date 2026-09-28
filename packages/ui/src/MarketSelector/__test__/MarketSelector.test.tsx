import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketSelector } from '..';

describe('MarketSelector dropdown', () => {
  it('closesDropdown_whenEscapePressed', async () => {
    const user = userEvent.setup();
    render(
      <MarketSelector
        items={[]}
        selectedId=""
        onSelect={jest.fn()}
        favorites={[]}
        onToggleFavorite={jest.fn()}
        initialOpen
      />,
    );
    expect(screen.getByPlaceholderText('Search')).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.queryByPlaceholderText('Search')).toBeNull();
  });
});
