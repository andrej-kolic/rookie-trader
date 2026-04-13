import React, { useState } from 'react';
import { debugLog } from './utils/debug';
import { TradingHeader } from './components/TradingHeader';
import { OrderBookDisplayContainer } from './containers/OrderBookDisplayContainer';
import { PriceChartContainer } from './containers/PriceChartContainer';
import { FooterContainer } from './containers/FooterContainer';
import { useAuth } from './hooks/use-auth';
import * as authService from './services/auth-service';

import '@repo/ui/theme.css';
import './styles.css';
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

  const handleLogout = () => {
    void authService.logout();
  };

  return (
    <div className="AppCore">
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

      <header className="AppCore__trading-header">
        <TradingHeader />
      </header>

      <main className="AppCore__main">
        <div className="AppCore__orderbook">
          <OrderBookDisplayContainer />
        </div>
        <div className="AppCore__chart">
          <PriceChartContainer />
        </div>
      </main>

      <FooterContainer />
    </div>
  );
}
