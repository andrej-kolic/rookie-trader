import React, { useState } from 'react';
import './LoginForm.css';

type LoginFormProps = {
  onSubmit: (apiKey: string, apiSecret: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onClose,
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
      className="LoginDialog__backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="LoginDialog__card">
        <div className="LoginDialog__header">
          <h2 id="login-dialog-title" className="LoginDialog__title">
            Connect to Kraken
          </h2>
          <button
            className="LoginDialog__close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>
        <form className="LoginDialog__form" onSubmit={handleSubmit}>
          <div className="LoginDialog__field">
            <label htmlFor="apiKey" className="LoginDialog__label">
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
              className="LoginDialog__input"
              autoComplete="off"
            />
          </div>
          <div className="LoginDialog__field">
            <label htmlFor="apiSecret" className="LoginDialog__label">
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
              className="LoginDialog__input"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="LoginDialog__error" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="LoginDialog__submit"
          >
            {isLoading ? 'Connecting…' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
};
