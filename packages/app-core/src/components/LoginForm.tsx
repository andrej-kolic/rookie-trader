import React, { useState } from 'react';

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
      className="fixed inset-0 z-200 flex items-center justify-center bg-(--theme-overlay) backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[380px] rounded-xl border border-border bg-surface p-8 text-ink shadow-[0_8px_32px_var(--theme-shadow),0_0_0_1px_rgb(255_255_255/4%)]">
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="login-dialog-title"
            className="text-xl font-semibold text-ink"
          >
            Connect to Kraken
          </h2>
          <button
            className="cursor-pointer rounded px-1.5 py-0.5 text-base leading-none text-muted transition-[color,background] duration-150 hover:bg-white/8 hover:text-ink"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="apiKey"
              className="text-[0.8125rem] font-medium tracking-[0.02em] text-muted uppercase"
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
              className="w-full rounded-md border border-border bg-void px-3 py-2 text-[0.9375rem] text-ink outline-none transition-[border-color] duration-150 focus:border-accent/70 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--theme-accent)_12%,transparent)]"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="apiSecret"
              className="text-[0.8125rem] font-medium tracking-[0.02em] text-muted uppercase"
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
              className="w-full rounded-md border border-border bg-void px-3 py-2 text-[0.9375rem] text-ink outline-none transition-[border-color] duration-150 focus:border-accent/70 focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--theme-accent)_12%,transparent)]"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div
              className="rounded-md border border-danger/40 bg-danger/15 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 cursor-pointer rounded-md bg-accent px-4 py-2.5 text-[0.9375rem] font-medium text-on-accent transition-[background] duration-150 enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Connecting…' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
};
