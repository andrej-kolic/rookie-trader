import React, { useState } from 'react';
import LogoIcon from './assets/idea.svg'; // TODO: report for bad path
import { AuthFormContainer } from '../../containers/AuthFormContainer';
import './styles.css';

export function Header({ title }: { title: string }): React.ReactNode {
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);

  const handleClick: React.MouseEventHandler<HTMLHeadingElement> = (event) => {
    console.log('* Header click:', event);
  };

  const toggleAuthDropdown = () => {
    setShowAuthDropdown(!showAuthDropdown);
  };

  return (
    <div className="Header">
      <img className="Header__logo" alt="Logo" src={LogoIcon} />
      <div className="Header__title" onClick={handleClick}>
        {title}
      </div>

      <div className="Header__auth">
        <button
          className="Header__auth-toggle"
          onClick={toggleAuthDropdown}
          aria-label="Toggle authentication"
        >
          🔐 API Auth
        </button>

        {showAuthDropdown && (
          <div className="Header__auth-dropdown">
            <div className="Header__auth-dropdown-content">
              <AuthFormContainer />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
