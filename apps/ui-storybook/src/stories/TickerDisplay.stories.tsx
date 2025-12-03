import type { Meta, StoryObj } from '@storybook/react-vite';
import { TickerDisplay } from '@repo/ui';

const meta = {
  title: 'Components/TickerDisplay',
  component: TickerDisplay,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {},
} satisfies Meta<typeof TickerDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    symbol: 'XBT/USD',
    lastPrice: '45,123.50',
    bid: '45,120.00',
    bidQty: '0.5',
    ask: '45,125.00',
    askQty: '1.2',
    high24h: '46,500.00',
    low24h: '44,000.00',
    volume24h: '1,234.56',
    changePct: '+2.34%',
    isPriceRising: true,
    loading: false,
  },
};

export const PriceRising: Story = {
  args: {
    symbol: 'ETH/USD',
    lastPrice: '3,456.78',
    bid: '3,455.00',
    bidQty: '10.5',
    ask: '3,458.50',
    askQty: '8.2',
    high24h: '3,500.00',
    low24h: '3,350.00',
    volume24h: '12,345.67',
    changePct: '+5.67%',
    isPriceRising: true,
    loading: false,
  },
};

export const PriceFalling: Story = {
  args: {
    symbol: 'BTC/EUR',
    lastPrice: '42,890.00',
    bid: '42,885.00',
    bidQty: '0.3',
    ask: '42,895.00',
    askQty: '0.7',
    high24h: '44,200.00',
    low24h: '42,500.00',
    volume24h: '987.65',
    changePct: '-2.89%',
    isPriceRising: false,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    symbol: 'XBT/USD',
    loading: true,
  },
};

export const LoadingWithLastTicker: Story = {
  args: {
    symbol: 'XBT/USD',
    lastPrice: '45,123.50',
    bid: '45,120.00',
    bidQty: '0.5',
    ask: '45,125.00',
    askQty: '1.2',
    high24h: '46,500.00',
    low24h: '44,000.00',
    volume24h: '1,234.56',
    changePct: '+2.34%',
    isPriceRising: true,
    loading: true,
  },
};

export const Error: Story = {
  args: {
    symbol: 'INVALID/PAIR',
    error: 'WebSocket connection failed',
  },
};

export const NoPairSelected: Story = {
  args: {
    symbol: 'No pair selected',
    loading: true,
  },
};

export const SmallChange: Story = {
  args: {
    symbol: 'USDT/USD',
    lastPrice: '1.0001',
    bid: '1.0000',
    bidQty: '10000.0',
    ask: '1.0002',
    askQty: '8500.0',
    high24h: '1.0005',
    low24h: '0.9998',
    volume24h: '1,234,567.89',
    changePct: '+0.01%',
    isPriceRising: true,
    loading: false,
  },
};
