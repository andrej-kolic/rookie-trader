import { useState, type FC } from 'react';
import { AuthForm } from '@repo/ui';
import { useAuth } from '../hooks/use-auth';

/**
 * AuthFormContainer - Connects AuthForm UI component to business logic
 * Manages form state and authentication flow
 */
export const AuthFormContainer: FC = () => {
  const {
    isAuthenticated,
    isValidating,
    authError,
    authenticate,
    logout,
    getMaskedApiKey,
  } = useAuth();

  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const handleSubmit = async () => {
    const success = await authenticate(apiKey, apiSecret);

    if (success) {
      // Clear form on successful authentication
      setApiKey('');
      setApiSecret('');
      setShowSecret(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Reset form state
    setApiKey('');
    setApiSecret('');
    setShowSecret(false);
  };

  return (
    <AuthForm
      isAuthenticated={isAuthenticated}
      isValidating={isValidating}
      error={authError?.message ?? null}
      maskedApiKey={getMaskedApiKey()}
      apiKey={apiKey}
      apiSecret={apiSecret}
      showSecret={showSecret}
      onApiKeyChange={setApiKey}
      onApiSecretChange={setApiSecret}
      onToggleSecretVisibility={() => {
        setShowSecret(!showSecret);
      }}
      onSubmit={() => void handleSubmit()}
      onLogout={handleLogout}
    />
  );
};
