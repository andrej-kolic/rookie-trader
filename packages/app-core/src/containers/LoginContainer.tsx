import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { saveToken } from '../utils/auth';
import { getEnvironmentVariables } from '../utils/environment';

export const LoginContainer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (apiKey: string, apiSecret: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const krakenProxyUrl =
        getEnvironmentVariables().APP_REACT_KRAKEN_PROXY_URL;
      const response = await fetch(`${krakenProxyUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey, apiSecret }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = (await response.json()) as { token: string };
      console.log('Login successful:', data);
      saveToken(data.token);

      // Reload to apply authenticated state (simplest approach for now)
      // window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
  );
};
