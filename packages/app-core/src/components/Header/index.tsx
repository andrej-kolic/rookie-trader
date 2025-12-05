import React from 'react';
import LogoIcon from './assets/idea.svg'; // TODO: report for bad path
import GithubIcon from './assets/github-mark.svg'; // TODO: report for bad path
import { SystemStatusContainer } from '../../containers/SystemStatusContainer';
import './styles.css';

export function Header({ title }: { title: string }): React.ReactNode {
  const handleClick: React.MouseEventHandler<HTMLHeadingElement> = (event) => {
    console.log('* Header click:', event);
  };

  return (
    <div className="Header">
      <div className="Header__logo-container">
        <img className="Header__logo" alt="Logo" src={LogoIcon} />
        <div className="Header__title" onClick={handleClick}>
          {title}
        </div>
      </div>

      <SystemStatusContainer />

      <a
        href="https://github.com/andrej-kolic/rookie-trader"
        target="_blank"
        rel="noopener noreferrer"
        title="https://github.com/andrej-kolic/rookie-trader"
      >
        <img className="Header__github" alt="Github" src={GithubIcon} />
      </a>
    </div>
  );
}
