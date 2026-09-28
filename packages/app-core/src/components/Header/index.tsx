import React, { useRef, useState } from 'react';
import LogoIcon from './assets/idea.svg'; // TODO: report for bad path
import { Button, IconButton, useDismiss } from '@repo/ui';
import { SystemStatusContainer } from '../../containers/SystemStatusContainer';
import { header } from './styles';
import { GithubIcon } from './GithubIcon';

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ['/'], action: 'Open market selector' },
  { keys: ['↑', '↓'], action: 'Move through markets' },
  { keys: ['Enter'], action: 'Select market' },
  { keys: ['Esc'], action: 'Close popup' },
];

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
  const authRef = useRef<HTMLDivElement>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  const s = header();

  useDismiss(menuOpen, [authRef], () => {
    setMenuOpen(false);
  });

  useDismiss(helpOpen, [helpRef], () => {
    setHelpOpen(false);
  });

  const handleClick: React.MouseEventHandler<HTMLHeadingElement> = (_event) => {
    window.location.href = '/';
  };

  return (
    <div className={s.root()}>
      <div className={s.brand()} onClick={handleClick}>
        <img className={s.logo()} alt="Logo" src={LogoIcon} />
        <div className={s.title()}>{title}</div>
      </div>

      <SystemStatusContainer />

      <div className={s.actions()}>
        {!isAuthenticated && (
          <IconButton title="Connect to Kraken" onClick={onLoginClick}>
            <svg
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
          </IconButton>
        )}
        {isAuthenticated && (
          <div className={s.auth()} ref={authRef}>
            <IconButton
              dot="success"
              title="Connected to Kraken — click to disconnect"
              onClick={() => {
                setMenuOpen((o) => !o);
              }}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <svg
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
            </IconButton>
            {menuOpen && (
              <div className={s.menu()}>
                <p className={s.menuLabel()}>✓ Connected to Kraken</p>
                <Button
                  intent="danger-subtle"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout?.();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? 'Disconnecting…' : 'Disconnect'}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className={s.help()} ref={helpRef}>
          <IconButton
            title="Keyboard shortcuts"
            onClick={() => {
              setHelpOpen((o) => !o);
            }}
            aria-haspopup="true"
            aria-expanded={helpOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8.5 8.5a3.5 3.5 0 0 1 6.8 1.2c0 2.3-3.3 3-3.3 5" />
              <path d="M12 19.5h.01" />
            </svg>
          </IconButton>
          {helpOpen && (
            <div className={s.menu()}>
              <h2 className={s.menuTitle()}>Keyboard shortcuts</h2>
              <dl className={s.shortcuts()}>
                {SHORTCUTS.map(({ keys, action }) => (
                  <div key={action} className={s.shortcut()}>
                    <dt>{action}</dt>
                    <dd className={s.keys()}>
                      {keys.map((key) => (
                        <kbd key={key} className={s.key()}>
                          {key}
                        </kbd>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <a
          href="https://github.com/andrej-kolic/rookie-trader"
          target="_blank"
          rel="noopener noreferrer"
          title="https://github.com/andrej-kolic/rookie-trader"
          aria-label="GitHub"
        >
          <GithubIcon className={s.github()} />
        </a>
      </div>
    </div>
  );
}
