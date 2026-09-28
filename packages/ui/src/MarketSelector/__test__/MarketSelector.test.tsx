import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketSelector, type MarketItem } from '..';

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

const ITEMS: MarketItem[] = ['BTC/USD', 'ETH/USD', 'SOL/USD'].map((symbol) => {
  const [base = '', quote = ''] = symbol.split('/');
  return { id: symbol, symbol, base, quote, isMarginable: false };
});

function renderOpen(selectedId = '') {
  const onSelect = jest.fn();
  render(
    <MarketSelector
      items={ITEMS}
      selectedId={selectedId}
      onSelect={onSelect}
      favorites={[]}
      onToggleFavorite={jest.fn()}
      initialOpen
    />,
  );
  return { onSelect, user: userEvent.setup() };
}

describe('MarketSelector keyboard navigation', () => {
  it('selectsFirstItem_whenEnterPressedWithoutNavigating', async () => {
    const { onSelect, user } = renderOpen();

    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('BTC/USD');
    expect(screen.queryByPlaceholderText('Search')).toBeNull();
  });

  it('selectsNextItem_whenArrowDownThenEnterPressed', async () => {
    const { onSelect, user } = renderOpen();

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}');

    expect(onSelect).toHaveBeenCalledWith('ETH/USD');
  });

  it('startsFromSelectedItem_whenOpened', async () => {
    const { onSelect, user } = renderOpen('ETH/USD');

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith('SOL/USD');
  });

  it('staysOnFirstItem_whenArrowUpPressedAtStart', async () => {
    const { onSelect, user } = renderOpen();

    await user.keyboard('{ArrowUp}{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('BTC/USD');
  });

  it('staysOnLastItem_whenArrowDownPressedPastEnd', async () => {
    const { onSelect, user } = renderOpen();

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith('SOL/USD');
  });

  it('navigatesFilteredList_whenSearchNarrowsResults', async () => {
    const { onSelect, user } = renderOpen('SOL/USD');

    await user.keyboard('usd');
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelect).toHaveBeenCalledWith('ETH/USD');
  });
});
