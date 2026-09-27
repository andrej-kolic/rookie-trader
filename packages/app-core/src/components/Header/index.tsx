import React, { useState } from 'react';
import LogoIcon from './assets/idea.svg'; // TODO: report for bad path
import GithubIcon from './assets/github-mark.svg'; // TODO: report for bad path
import { SystemStatusContainer } from '../../containers/SystemStatusContainer';

type HeaderProps = {
  title: string;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  onLogout?: () => void;
  onLoginClick?: () => void;
};

export function Header({
  title,
  isAuthenticated,
  isLoading,
  onLogout,
  onLoginClick,
}: HeaderProps): React.ReactNode {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick: React.MouseEventHandler<HTMLHeadingElement> = (_event) => {
    window.location.href = '/';
  };

  return (
    <div className="flex items-center justify-between gap-2.5">
      <div
        className="flex cursor-pointer items-center justify-center gap-[7px]"
        onClick={handleClick}
      >
        <img
          className="relative -left-[5px] w-[42px]"
          alt="Logo"
          src={LogoIcon}
        />
        <div className="text-[28px] opacity-75 [text-shadow:0_0_6px_rgb(255_255_255/95%),0_0_42px_rgb(255_255_255/60%)]">
          {title}
        </div>
      </div>

      <SystemStatusContainer />

      <div className="flex items-center gap-3">
        {!isAuthenticated && (
          <button
            className="flex size-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0 transition-[opacity,background] duration-150 hover:opacity-100 text-muted opacity-70 hover:bg-muted/12"
            title="Connect to Kraken"
            onClick={onLoginClick}
          >
            <svg
              className="size-[22px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
          </button>
        )}
        {isAuthenticated && (
          <div className="relative">
            <button
              className="flex size-8 cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-0 transition-[opacity,background] duration-150 hover:opacity-100 text-success opacity-90 hover:bg-success/12"
              title="Connected to Kraken — click to disconnect"
              onClick={() => {
                setMenuOpen((o) => !o);
              }}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <svg
                className="size-[22px]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute top-[calc(100%+8px)] right-0 z-100 min-w-[200px] rounded-lg border border-success bg-surface p-3 shadow-[0_4px_20px_var(--theme-shadow)]">
                <p className="mt-0 mb-2.5 text-[13px] font-medium text-success">
                  ✓ Connected to Kraken
                </p>
                <button
                  className="w-full cursor-pointer rounded border-none bg-danger px-3 py-[7px] text-[13px] text-void transition-[background] duration-150 enabled:hover:bg-[color-mix(in_oklab,var(--theme-danger)_80%,black)] disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>
            )}
          </div>
        )}

        <a
          href="https://github.com/andrej-kolic/rookie-trader"
          target="_blank"
          rel="noopener noreferrer"
          title="https://github.com/andrej-kolic/rookie-trader"
        >
          <img
            className="relative block w-8 opacity-90"
            alt="Github"
            src={GithubIcon}
          />
        </a>
      </div>
    </div>
  );
}
