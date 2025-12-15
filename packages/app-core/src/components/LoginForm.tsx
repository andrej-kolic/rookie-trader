import React, { useState } from 'react';

type LoginFormProps = {
  onSubmit: (apiKey: string, apiSecret: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(apiKey, apiSecret);
  };

  return (
    <div
      className="login-form-container"
      style={{
        maxWidth: '400px',
        margin: '2rem auto',
        padding: '2rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h2>Connect to Kraken</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <div>
          <label
            htmlFor="apiKey"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            API Key
          </label>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
            }}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div>
          <label
            htmlFor="apiSecret"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            API Secret
          </label>
          <input
            id="apiSecret"
            type="password"
            value={apiSecret}
            onChange={(e) => {
              setApiSecret(e.target.value);
            }}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
};
