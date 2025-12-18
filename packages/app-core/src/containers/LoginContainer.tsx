import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/use-auth';

export const LoginContainer: React.FC = () => {
  const { login, logout, isLoading, error, isAuthenticated } = useAuth();

  const handleLogin = async (apiKey: string, apiSecret: string) => {
    try {
      await login(apiKey, apiSecret);
      // Login successful - state is now updated globally
    } catch (err) {
      // Error is already set in the store
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Show logout button if authenticated
  if (isAuthenticated) {
    return (
      <div
        className="auth-status-container"
        style={{
          maxWidth: '400px',
          margin: '2rem auto',
          padding: '2rem',
          border: '1px solid #28a745',
          borderRadius: '8px',
          backgroundColor: '#d4edda',
        }}
      >
        <h2 style={{ color: '#155724', marginBottom: '1rem' }}>
          ✓ Connected to Kraken
        </h2>
        <p style={{ color: '#155724', marginBottom: '1rem' }}>
          Your API credentials are securely stored.
        </p>
        <button
          onClick={() => void handleLogout()}
          disabled={isLoading}
          style={{
            padding: '0.75rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {isLoading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    );
  }

  return (
    <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
  );
};
