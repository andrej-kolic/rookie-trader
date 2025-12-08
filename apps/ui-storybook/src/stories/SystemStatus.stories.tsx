import type { Meta, StoryObj } from '@storybook/react-vite';
import { SystemStatus } from '@repo/ui';

const meta = {
  title: 'Components/SystemStatus',
  component: SystemStatus,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: [
        'online',
        'maintenance',
        'cancel_only',
        'limit_only',
        'post_only',
        'offline',
      ],
    },
  },
} satisfies Meta<typeof SystemStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = {
  args: {
    status: 'online',
  },
};

export const Maintenance: Story = {
  args: {
    status: 'maintenance',
  },
};

export const CancelOnly: Story = {
  args: {
    status: 'cancel_only',
  },
};

export const LimitOnly: Story = {
  args: {
    status: 'limit_only',
  },
};

export const PostOnly: Story = {
  args: {
    status: 'post_only',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
  },
};
