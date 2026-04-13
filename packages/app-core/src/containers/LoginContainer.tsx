import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/use-auth';

type LoginContainerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const LoginContainer: React.FC<LoginContainerProps> = ({
  isOpen,
  onClose,
}) => {
  const { login, isLoading, error, isAuthenticated } = useAuth();

  const handleLogin = async (apiKey: string, apiSecret: string) => {
    try {
      await login(apiKey, apiSecret);
      onClose();
    } catch (err) {
      // Error is already set in the store
      console.error('Login failed:', err);
    }
  };

  if (!isOpen || isAuthenticated) {
    return null;
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      onClose={onClose}
      isLoading={isLoading}
      error={error}
    />
  );
};
