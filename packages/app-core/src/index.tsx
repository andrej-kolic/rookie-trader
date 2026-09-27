import React, { useState } from 'react';
import { debugLog } from './utils/debug';
import { TradingHeader } from './components/TradingHeader';
import { OrderBookDisplayContainer } from './containers/OrderBookDisplayContainer';
import { PriceChartContainer } from './containers/PriceChartContainer';
import { FooterContainer } from './containers/FooterContainer';
import { useAuth } from './hooks/use-auth';
import * as authService from './services/auth-service';

import './styles.css';
import { appLayout } from './app.styles';
import { Header } from './components/Header';
import { LoginContainer } from './containers/LoginContainer';

export function AppCore(_props: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}): React.JSX.Element {
  debugLog();

  const { isAuthenticated, isLoading } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const s = appLayout();

  const handleLogout = () => {
    void authService.logout();
  };

  return (
    <div className={s.root()}>
      <Header
        title="Rookie"
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        onLogout={handleLogout}
        onLoginClick={() => {
          setIsLoginOpen(true);
        }}
      />

      <LoginContainer
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
        }}
      />

      <header className={s.tradingHeader()}>
        <TradingHeader />
      </header>

      <main className={s.main()}>
        <div className={s.panel({ className: 'col-[1]' })}>
          <OrderBookDisplayContainer />
        </div>
        <div className={s.panel({ className: 'col-[2]' })}>
          <PriceChartContainer />
        </div>
      </main>

      <FooterContainer />
    </div>
  );
}
