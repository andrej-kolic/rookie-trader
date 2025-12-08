import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  MarketSelector,
  type MarketItem,
  type MarketSelectorProps,
} from '@repo/ui';

const meta = {
  title: 'Components/MarketSelector',
  component: MarketSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MarketSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample market data for stories
const sampleMarkets: MarketItem[] = [
  {
    id: '1',
    symbol: 'BTC/USD',
    base: 'BTC',
    quote: 'USD',
    isMarginable: true,
    leverage: '5x',
  },
  {
    id: '2',
    symbol: 'ETH/USD',
    base: 'ETH',
    quote: 'USD',
    isMarginable: true,
    leverage: '3x',
  },
  {
    id: '3',
    symbol: 'XRP/USD',
    base: 'XRP',
    quote: 'USD',
    isMarginable: false,
  },
  {
    id: '4',
    symbol: 'SOL/USD',
    base: 'SOL',
    quote: 'USD',
    isMarginable: true,
    leverage: '5x',
  },
  {
    id: '5',
    symbol: 'ADA/USD',
    base: 'ADA',
    quote: 'USD',
    isMarginable: false,
  },
  {
    id: '6',
    symbol: 'DOGE/USD',
    base: 'DOGE',
    quote: 'USD',
    isMarginable: false,
  },
  {
    id: '7',
    symbol: 'DOT/USD',
    base: 'DOT',
    quote: 'USD',
    isMarginable: true,
    leverage: '3x',
  },
  {
    id: '8',
    symbol: 'AVAX/USD',
    base: 'AVAX',
    quote: 'USD',
    isMarginable: true,
    leverage: '5x',
  },
  {
    id: '9',
    symbol: 'MATIC/USD',
    base: 'MATIC',
    quote: 'USD',
    isMarginable: false,
  },
  {
    id: '10',
    symbol: 'LINK/USD',
    base: 'LINK',
    quote: 'USD',
    isMarginable: true,
    leverage: '3x',
  },
  {
    id: '11',
    symbol: 'UNI/USD',
    base: 'UNI',
    quote: 'USD',
    isMarginable: false,
  },
  {
    id: '12',
    symbol: 'ATOM/USD',
    base: 'ATOM',
    quote: 'USD',
    isMarginable: true,
    leverage: '5x',
  },
  {
    id: '13',
    symbol: 'LTC/USD',
    base: 'LTC',
    quote: 'USD',
    isMarginable: false,
  },
  {
    id: '14',
    symbol: 'BTC/EUR',
    base: 'BTC',
    quote: 'EUR',
    isMarginable: true,
    leverage: '5x',
  },
  {
    id: '15',
    symbol: 'ETH/EUR',
    base: 'ETH',
    quote: 'EUR',
    isMarginable: true,
    leverage: '3x',
  },
  {
    id: '16',
    symbol: 'XRP/EUR',
    base: 'XRP',
    quote: 'EUR',
    isMarginable: false,
  },
  {
    id: '17',
    symbol: 'SOL/EUR',
    base: 'SOL',
    quote: 'EUR',
    isMarginable: true,
    leverage: '5x',
  },
  {
    id: '18',
    symbol: 'ADA/EUR',
    base: 'ADA',
    quote: 'EUR',
    isMarginable: false,
  },
  {
    id: '19',
    symbol: 'BTC/GBP',
    base: 'BTC',
    quote: 'GBP',
    isMarginable: true,
    leverage: '5x',
  },
  {
    id: '20',
    symbol: 'ETH/GBP',
    base: 'ETH',
    quote: 'GBP',
    isMarginable: true,
    leverage: '3x',
  },
];

// Helper component for interactive stories
function MarketSelectorWithState(
  props: Partial<typeof MarketSelector.prototype.props>,
) {
  const [selectedId, setSelectedId] = useState('1');
  const [favorites, setFavorites] = useState<string[]>(['1', '2']);

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  return (
    <MarketSelector
      items={sampleMarkets}
      selectedId={selectedId}
      onSelect={setSelectedId}
      favorites={favorites}
      onToggleFavorite={handleToggleFavorite}
      {...props}
    />
  );
}

export const Default: Story = {
  args: {} as MarketSelectorProps,
  render: () => <MarketSelectorWithState initialOpen={true} />,
};

export const WithCustomPlaceholder: Story = {
  args: {} as MarketSelectorProps,
  render: () => (
    <MarketSelectorWithState placeholder="Choose a market" initialOpen={true} />
  ),
};

export const SingleMarket: Story = {
  args: {} as MarketSelectorProps,
  render: () => {
    const [selectedId, setSelectedId] = useState('1');
    const [favorites, setFavorites] = useState<string[]>([]);

    return (
      <MarketSelector
        items={[sampleMarkets[0]]}
        selectedId={selectedId}
        onSelect={setSelectedId}
        favorites={favorites}
        onToggleFavorite={(id) => {
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((fav) => fav !== id)
              : [...prev, id],
          );
        }}
        initialOpen={true}
      />
    );
  },
};

export const NoFavorites: Story = {
  args: {} as MarketSelectorProps,
  render: () => {
    const [selectedId, setSelectedId] = useState('1');
    const [favorites, setFavorites] = useState<string[]>([]);

    return (
      <MarketSelector
        items={sampleMarkets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        favorites={favorites}
        onToggleFavorite={(id) => {
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((fav) => fav !== id)
              : [...prev, id],
          );
        }}
        initialOpen={true}
      />
    );
  },
};

export const ManyFavorites: Story = {
  args: {} as MarketSelectorProps,
  render: () => {
    const [selectedId, setSelectedId] = useState('1');
    const [favorites, setFavorites] = useState<string[]>([
      '1',
      '2',
      '4',
      '7',
      '8',
      '10',
      '12',
      '14',
      '15',
    ]);

    return (
      <MarketSelector
        items={sampleMarkets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        favorites={favorites}
        onToggleFavorite={(id) => {
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((fav) => fav !== id)
              : [...prev, id],
          );
        }}
        initialOpen={true}
      />
    );
  },
};

export const OnlyMarginMarkets: Story = {
  args: {} as MarketSelectorProps,
  render: () => {
    const marginMarkets = sampleMarkets.filter((m) => m.isMarginable);
    const [selectedId, setSelectedId] = useState(marginMarkets[0].id);
    const [favorites, setFavorites] = useState<string[]>([marginMarkets[0].id]);

    return (
      <MarketSelector
        items={marginMarkets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        favorites={favorites}
        onToggleFavorite={(id) => {
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((fav) => fav !== id)
              : [...prev, id],
          );
        }}
        initialOpen={true}
      />
    );
  },
};

export const OnlySpotMarkets: Story = {
  args: {} as MarketSelectorProps,
  render: () => {
    const spotMarkets = sampleMarkets.filter((m) => !m.isMarginable);
    const [selectedId, setSelectedId] = useState(spotMarkets[0].id);
    const [favorites, setFavorites] = useState<string[]>([]);

    return (
      <MarketSelector
        items={spotMarkets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        favorites={favorites}
        onToggleFavorite={(id) => {
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((fav) => fav !== id)
              : [...prev, id],
          );
        }}
        initialOpen={true}
      />
    );
  },
};

export const NoSelection: Story = {
  args: {} as MarketSelectorProps,
  render: () => {
    const [selectedId, setSelectedId] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);

    return (
      <MarketSelector
        items={sampleMarkets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        favorites={favorites}
        onToggleFavorite={(id) => {
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((fav) => fav !== id)
              : [...prev, id],
          );
        }}
        placeholder="No market selected"
        initialOpen={true}
      />
    );
  },
};

export const EmptyMarketsList: Story = {
  args: {} as MarketSelectorProps,
  render: () => {
    const [selectedId, setSelectedId] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);

    return (
      <MarketSelector
        items={[]}
        selectedId={selectedId}
        onSelect={setSelectedId}
        favorites={favorites}
        onToggleFavorite={(id) => {
          setFavorites((prev) =>
            prev.includes(id)
              ? prev.filter((fav) => fav !== id)
              : [...prev, id],
          );
        }}
        placeholder="No markets available"
        initialOpen={true}
      />
    );
  },
};
