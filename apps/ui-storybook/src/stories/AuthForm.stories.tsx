import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AuthForm, type AuthFormProps } from '@repo/ui';

const meta: Meta<typeof AuthForm> = {
  title: 'Components/AuthForm',
  component: AuthForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive wrapper to manage form state
 */
function InteractiveAuthForm(props: Partial<AuthFormProps>) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  return (
    <AuthForm
      isAuthenticated={false}
      isValidating={false}
      error={null}
      maskedApiKey=""
      apiKey={apiKey}
      apiSecret={apiSecret}
      showSecret={showSecret}
      onApiKeyChange={setApiKey}
      onApiSecretChange={setApiSecret}
      onToggleSecretVisibility={() => {
        setShowSecret(!showSecret);
      }}
      onSubmit={() => {
        // Story action - would validate credentials in real app
      }}
      onLogout={() => {
        // Story action - would clear credentials in real app
      }}
      {...props}
    />
  );
}

/**
 * Default login form state
 */
export const Default: Story = {
  render: () => <InteractiveAuthForm />,
};

/**
 * Form with validation in progress
 */
export const Validating: Story = {
  render: () => (
    <InteractiveAuthForm
      isValidating={true}
      apiKey="abcd1234EFGH5678ijkl9012MNOP3456qrst7890UVWX1234yzab5678"
      apiSecret="ABCDEFGH12345678ijklmnopQRSTUVWX90123456abcdefgh"
    />
  ),
};

/**
 * Form with invalid credentials error
 */
export const ErrorInvalidCredentials: Story = {
  render: () => (
    <InteractiveAuthForm
      error="Invalid API key or secret"
      apiKey="invalid_key_123"
      apiSecret="invalid_secret_456"
    />
  ),
};

/**
 * Form with permission denied error
 */
export const ErrorPermissionDenied: Story = {
  render: () => (
    <InteractiveAuthForm
      error="API key does not have required permissions"
      apiKey="abcd1234EFGH5678ijkl9012MNOP3456qrst7890UVWX1234yzab5678"
      apiSecret="ABCDEFGH12345678ijklmnopQRSTUVWX90123456abcdefgh"
    />
  ),
};

/**
 * Form with network error
 */
export const ErrorNetwork: Story = {
  render: () => (
    <InteractiveAuthForm
      error="Network error: Unable to reach Kraken API"
      apiKey="abcd1234EFGH5678ijkl9012MNOP3456qrst7890UVWX1234yzab5678"
      apiSecret="ABCDEFGH12345678ijklmnopQRSTUVWX90123456abcdefgh"
    />
  ),
};

/**
 * Authenticated state showing masked API key
 */
export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    isValidating: false,
    error: null,
    maskedApiKey: 'abcd...5678',
    apiKey: '',
    apiSecret: '',
    showSecret: false,
    onApiKeyChange: () => {
      // Story action
    },
    onApiSecretChange: () => {
      // Story action
    },
    onToggleSecretVisibility: () => {
      // Story action
    },
    onSubmit: () => {
      // Story action
    },
    onLogout: () => {
      // Story action
    },
  },
};

/**
 * Form with secret visibility toggled on
 */
export const SecretVisible: Story = {
  render: () => (
    <InteractiveAuthForm
      apiKey="abcd1234EFGH5678ijkl9012MNOP3456qrst7890UVWX1234yzab5678"
      apiSecret="ABCDEFGH12345678ijklmnopQRSTUVWX90123456abcdefgh"
      showSecret={true}
    />
  ),
};

/**
 * Form with partial input
 */
export const PartialInput: Story = {
  render: () => <InteractiveAuthForm apiKey="abcd1234EFGH5678" apiSecret="" />,
};

/**
 * Mobile responsive view (narrow width)
 */
export const Mobile: Story = {
  render: () => <InteractiveAuthForm />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
