import React, { useState } from 'react';
import LogoIcon from './assets/idea.svg'; // TODO: report for bad path
import GithubIcon from './assets/github-mark.svg'; // TODO: report for bad path
import { SystemStatusContainer } from '../../containers/SystemStatusContainer';
import './styles.css';

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
    <div className="Header">
      <div className="Header__logo-container" onClick={handleClick}>
        <img className="Header__logo" alt="Logo" src={LogoIcon} />
        <div className="Header__title">{title}</div>
      </div>

      <SystemStatusContainer />

      <div className="Header__actions">
        {!isAuthenticated && (
          <button
            className="Header__auth-btn Header__auth-btn--unlocked"
            title="Connect to Kraken"
            onClick={onLoginClick}
          >
            <svg
              className="Header__auth-icon"
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
          <div className="Header__auth">
            <button
              className="Header__auth-btn"
              title="Connected to Kraken — click to disconnect"
              onClick={() => {
                setMenuOpen((o) => !o);
              }}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <svg
                className="Header__auth-icon"
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
              <div className="Header__auth-menu">
                <p className="Header__auth-menu-label">✓ Connected to Kraken</p>
                <button
                  className="Header__auth-menu-disconnect"
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
          <img className="Header__github" alt="Github" src={GithubIcon} />
        </a>
      </div>
    </div>
  );
}
