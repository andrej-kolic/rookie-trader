import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrderBookDisplay } from '@repo/ui';

const meta = {
  title: 'Components/OrderBookDisplay',
  component: OrderBookDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {},
} satisfies Meta<typeof OrderBookDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create mock order book levels
const createMockLevels = (basePrice: number, count: number, isAsk = false) => {
  return Array.from({ length: count }, (_, i) => {
    const priceOffset = isAsk ? i * 10 : -i * 10;
    const price = basePrice + priceOffset;
    const quantity = Math.random() * 5 + 0.5;
    const total = quantity * (i + 1);
    const depthPercentage = ((i + 1) / count) * 100;

    return {
      price: price.toFixed(2),
      quantity: quantity.toFixed(4),
      total: total.toFixed(4),
      depthPercentage,
    };
  });
};

export const Default: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: createMockLevels(42150, 10, false),
    asks: createMockLevels(42160, 10, true),
    spread: '10.00',
    spreadPct: '0.0237%',
  },
};

export const TightSpread: Story = {
  args: {
    symbol: 'ETH/USD',
    bids: createMockLevels(2250.5, 10, false),
    asks: createMockLevels(2250.6, 10, true),
    spread: '0.10',
    spreadPct: '0.0044%',
  },
};

export const WideSpread: Story = {
  args: {
    symbol: 'DOGE/USD',
    bids: createMockLevels(0.1, 10, false),
    asks: createMockLevels(0.105, 10, true),
    spread: '0.0050',
    spreadPct: '4.88%',
  },
};

export const ShallowBook: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: createMockLevels(42150, 5, false),
    asks: createMockLevels(42160, 5, true),
    spread: '10.00',
    spreadPct: '0.0237%',
  },
};

export const DeepBook: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: createMockLevels(42150, 25, false),
    asks: createMockLevels(42160, 25, true),
    spread: '10.00',
    spreadPct: '0.0237%',
  },
};

export const BidHeavy: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: createMockLevels(42150, 15, false),
    asks: createMockLevels(42160, 5, true),
    spread: '10.00',
    spreadPct: '0.0237%',
  },
};

export const AskHeavy: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: createMockLevels(42150, 5, false),
    asks: createMockLevels(42160, 15, true),
    spread: '10.00',
    spreadPct: '0.0237%',
  },
};

export const Loading: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: [],
    asks: [],
    loading: true,
  },
};

export const Error: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: [],
    asks: [],
    error: 'Failed to connect to WebSocket',
  },
};

export const NoPairSelected: Story = {
  args: {
    symbol: 'No pair selected',
    bids: [],
    asks: [],
  },
};

export const NoBids: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: [],
    asks: createMockLevels(42160, 10, true),
    spread: '—',
    spreadPct: '—',
  },
};

export const NoAsks: Story = {
  args: {
    symbol: 'BTC/USD',
    bids: createMockLevels(42150, 10, false),
    asks: [],
    spread: '—',
    spreadPct: '—',
  },
};
