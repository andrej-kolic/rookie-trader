import type { FC, FormEvent, ChangeEvent } from 'react';
import './styles.css';

export type AuthFormProps = {
  // State
  isAuthenticated: boolean;
  isValidating: boolean;
  error: string | null;
  maskedApiKey: string;

  // Form values
  apiKey: string;
  apiSecret: string;
  showSecret: boolean;

  // Event handlers
  onApiKeyChange: (value: string) => void;
  onApiSecretChange: (value: string) => void;
  onToggleSecretVisibility: () => void;
  onSubmit: () => void;
  onLogout: () => void;
};

/**
 * AuthForm - Generic authentication form component
 * Displays login form when not authenticated, or user info when authenticated
 */
export const AuthForm: FC<AuthFormProps> = ({
  isAuthenticated,
  isValidating,
  error,
  maskedApiKey,
  apiKey,
  apiSecret,
  showSecret,
  onApiKeyChange,
  onApiSecretChange,
  onToggleSecretVisibility,
  onSubmit,
  onLogout,
}) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleApiKeyChange = (e: ChangeEvent<HTMLInputElement>) => {
    onApiKeyChange(e.target.value);
  };

  const handleApiSecretChange = (e: ChangeEvent<HTMLInputElement>) => {
    onApiSecretChange(e.target.value);
  };

  // Authenticated view
  if (isAuthenticated) {
    return (
      <div className="auth-form auth-form--authenticated">
        <div className="auth-form__user-info">
          <div className="auth-form__user-icon">🔐</div>
          <div className="auth-form__user-details">
            <div className="auth-form__user-label">API Key</div>
            <div className="auth-form__user-value">{maskedApiKey}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="auth-form__button auth-form__button--logout"
        >
          Logout
        </button>
      </div>
    );
  }

  // Login form view
  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit} className="auth-form__form">
        <div className="auth-form__header">
          <h3 className="auth-form__title">Kraken API Authentication</h3>
          <p className="auth-form__description">
            Enter your API credentials to access private endpoints
          </p>
        </div>

        {error && (
          <div className="auth-form__error">
            <span className="auth-form__error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="api-key" className="auth-form__label">
              API Key
            </label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={handleApiKeyChange}
              disabled={isValidating}
              placeholder="Enter your Kraken API key"
              className="auth-form__input"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="api-secret" className="auth-form__label">
              API Secret
            </label>
            <div className="auth-form__input-wrapper">
              <input
                id="api-secret"
                type={showSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={handleApiSecretChange}
                disabled={isValidating}
                placeholder="Enter your Kraken API secret"
                className="auth-form__input auth-form__input--with-toggle"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={onToggleSecretVisibility}
                className="auth-form__toggle-visibility"
                aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                tabIndex={-1}
              >
                {showSecret ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isValidating || !apiKey || !apiSecret}
          className="auth-form__button auth-form__button--submit"
        >
          {isValidating ? (
            <>
              <span className="auth-form__spinner" />
              Validating...
            </>
          ) : (
            'Authenticate'
          )}
        </button>

        <p className="auth-form__notice">
          Your credentials are stored locally in your browser and never sent to
          any third party.
        </p>
      </form>
    </div>
  );
};
