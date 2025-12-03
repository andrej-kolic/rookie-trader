import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceChart } from '@repo/ui';

const meta: Meta<typeof PriceChart> = {
  title: 'Components/PriceChart',
  component: PriceChart,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '600px', padding: '16px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PriceChart>;

// Helper to generate mock candles
function generateMockCandles(
  count: number,
  basePrice: number,
  volatility: number,
  trend: 'up' | 'down' | 'sideways' = 'sideways',
) {
  const candles = [];
  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count - 1; i >= 0; i--) {
    const open = currentPrice;

    // Apply trend
    let trendAdjustment = 0;
    if (trend === 'up') {
      trendAdjustment = (Math.random() * volatility) / 2;
    } else if (trend === 'down') {
      trendAdjustment = -(Math.random() * volatility) / 2;
    }

    const change = (Math.random() - 0.5) * volatility + trendAdjustment;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.3;
    const low = Math.min(open, close) - Math.random() * volatility * 0.3;

    candles.push({
      time: now - i * 3600,
      open,
      high,
      low,
      close,
    });

    currentPrice = close;
  }

  return candles;
}

// Generate volume data
function generateVolumeData(
  candles: { time: number; open: number; close: number }[],
) {
  return candles.map((candle) => ({
    time: candle.time,
    value: Math.random() * 1000 + 100,
    color: candle.close > candle.open ? '#26a69a' : '#ef5350',
  }));
}

const mockCandles = generateMockCandles(100, 50000, 500);

export const Default: Story = {
  args: {
    candles: mockCandles,
    volumeData: generateVolumeData(mockCandles),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 60,
  },
};

export const BullishTrend: Story = {
  args: {
    candles: generateMockCandles(100, 45000, 300, 'up'),
    volumeData: generateVolumeData(generateMockCandles(100, 45000, 300, 'up')),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 240,
  },
};

export const BearishTrend: Story = {
  args: {
    candles: generateMockCandles(100, 55000, 300, 'down'),
    volumeData: generateVolumeData(
      generateMockCandles(100, 55000, 300, 'down'),
    ),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 240,
  },
};

export const HighVolatility: Story = {
  args: {
    candles: generateMockCandles(100, 50000, 1500),
    volumeData: generateVolumeData(generateMockCandles(100, 50000, 1500)),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 15,
  },
};

export const LowVolatility: Story = {
  args: {
    candles: generateMockCandles(100, 50000, 100),
    volumeData: generateVolumeData(generateMockCandles(100, 50000, 100)),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 1440,
  },
};

export const Loading: Story = {
  args: {
    candles: [],
    loading: true,
    error: null,
    symbol: 'ETH/USD',
    interval: 60,
  },
};

export const LoadingWithLastData: Story = {
  args: {
    candles: generateMockCandles(50, 3000, 50),
    volumeData: generateVolumeData(generateMockCandles(50, 3000, 50)),
    loading: true,
    error: null,
    symbol: 'ETH/USD',
    interval: 60,
  },
};

export const Error: Story = {
  args: {
    candles: [],
    loading: false,
    error: 'Failed to fetch OHLC data from Kraken API',
    symbol: 'SOL/USD',
    interval: 60,
  },
};

export const NoPairSelected: Story = {
  args: {
    candles: [],
    loading: false,
    error: null,
    symbol: '',
    interval: 60,
  },
};

export const ShortTimeframe1m: Story = {
  args: {
    candles: generateMockCandles(60, 50000, 200),
    volumeData: generateVolumeData(generateMockCandles(60, 50000, 200)),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 1,
  },
};

export const MediumTimeframe4h: Story = {
  args: {
    candles: generateMockCandles(168, 50000, 800),
    volumeData: generateVolumeData(generateMockCandles(168, 50000, 800)),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 240,
  },
};

export const LongTimeframe1d: Story = {
  args: {
    candles: generateMockCandles(365, 30000, 2000, 'up'),
    volumeData: generateVolumeData(generateMockCandles(365, 30000, 2000, 'up')),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 1440,
  },
};

export const SmallDataset: Story = {
  args: {
    candles: generateMockCandles(10, 50000, 300),
    volumeData: generateVolumeData(generateMockCandles(10, 50000, 300)),
    loading: false,
    error: null,
    symbol: 'BTC/USD',
    interval: 60,
  },
};
