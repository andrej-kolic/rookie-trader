import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ItemSelector,
  type SelectorItem,
  type SelectorDetails,
  type ItemSelectorProps,
} from '@repo/ui';
import { useState } from 'react';

const meta = {
  title: 'Components/ItemSelector',
  component: ItemSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSelect: { action: 'selected' },
  },
} satisfies Meta<typeof ItemSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockItems: SelectorItem[] = [
  { id: '1', label: 'Bitcoin/USD', sublabel: 'BTC/USD' },
  { id: '2', label: 'Ethereum/USD', sublabel: 'ETH/USD' },
  { id: '3', label: 'Solana/USD', sublabel: 'SOL/USD' },
  { id: '4', label: 'Cardano/USD', sublabel: 'ADA/USD' },
  { id: '5', label: 'Polkadot/USD', sublabel: 'DOT/USD' },
];

const renderMockDetails = (itemId: string): SelectorDetails | null => {
  const item = mockItems.find((i) => i.id === itemId);
  if (!item) return null;

  return {
    title: item.label,
    fields: [
      { label: 'Type', value: 'Cryptocurrency' },
      { label: 'Market', value: 'Spot Trading' },
      { label: 'Min Order', value: '0.0001' },
    ],
  };
};

// Interactive wrapper to manage state
function InteractiveSelector(args: ItemSelectorProps) {
  const [selectedId, setSelectedId] = useState(args.selectedId);

  return (
    <ItemSelector
      {...args}
      selectedId={selectedId}
      onSelect={(id: string) => {
        setSelectedId(id);
        args.onSelect(id);
      }}
    />
  );
}

export const Default: Story = {
  render: (args: ItemSelectorProps) => <InteractiveSelector {...args} />,
  args: {
    items: mockItems,
    selectedId: '',
    label: 'Trading Pair',
    placeholder: 'Select a trading pair...',
    renderDetails: renderMockDetails,
    onSelect: () => {
      /* noop */
    },
  },
};

export const WithSelection: Story = {
  render: (args: ItemSelectorProps) => <InteractiveSelector {...args} />,
  args: {
    items: mockItems,
    selectedId: '1',
    label: 'Trading Pair',
    placeholder: 'Select a trading pair...',
    renderDetails: renderMockDetails,
    onSelect: () => {
      /* noop */
    },
  },
};

export const Loading: Story = {
  args: {
    items: [],
    selectedId: '',
    loading: true,
    label: 'Trading Pair',
    onSelect: () => {
      /* noop */
    },
  },
};

export const Error: Story = {
  args: {
    items: [],
    selectedId: '',
    error: 'Failed to load trading pairs',
    label: 'Trading Pair',
    onSelect: () => {
      /* noop */
    },
  },
};

export const Empty: Story = {
  render: (args: ItemSelectorProps) => <InteractiveSelector {...args} />,
  args: {
    items: [],
    selectedId: '',
    label: 'Trading Pair',
    placeholder: 'No items available',
    onSelect: () => {
      /* noop */
    },
  },
};

export const WithoutDetails: Story = {
  render: (args: ItemSelectorProps) => <InteractiveSelector {...args} />,
  args: {
    items: mockItems,
    selectedId: '2',
    label: 'Asset',
    placeholder: 'Select an asset...',
    onSelect: () => {
      /* noop */
    },
    // No renderDetails provided
  },
};
