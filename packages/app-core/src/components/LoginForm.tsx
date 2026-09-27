import React, { useState } from 'react';
import { Button } from '@repo/ui';
import { loginForm } from './login-form.styles';

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
  const s = loginForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit(apiKey, apiSecret);
  };

  return (
    <div
      className={s.backdrop()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.card()}>
        <div className={s.header()}>
          <h2 id="login-dialog-title" className={s.title()}>
            Connect to Kraken
          </h2>
          <button
            className={s.close()}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>
        <form className={s.form()} onSubmit={handleSubmit}>
          <div className={s.field()}>
            <label htmlFor="apiKey" className={s.label()}>
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
              className={s.input()}
              autoComplete="off"
            />
          </div>
          <div className={s.field()}>
            <label htmlFor="apiSecret" className={s.label()}>
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
              className={s.input()}
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className={s.error()} role="alert">
              {error}
            </div>
          )}
          <Button type="submit" size="lg" className="mt-1" disabled={isLoading}>
            {isLoading ? 'Connecting…' : 'Connect'}
          </Button>
        </form>
      </div>
    </div>
  );
};
