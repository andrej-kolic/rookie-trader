import React, { useState } from 'react';
import { debugLog } from './utils/debug';
import { TradingHeader } from './components/TradingHeader';
import { OrderBookDisplayContainer } from './containers/OrderBookDisplayContainer';
import { PriceChartContainer } from './containers/PriceChartContainer';
import { FooterContainer } from './containers/FooterContainer';
import { useAuth } from './hooks/use-auth';
import * as authService from './services/auth-service';

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
    <div className="grid h-screen grid-rows-[auto_auto_1fr_auto] gap-4 overflow-hidden p-4 max-md:flex max-md:h-auto max-md:min-h-screen max-md:flex-col max-md:overflow-visible">
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

      <header className="min-w-0 overflow-visible">
        <TradingHeader />
      </header>

      <main className="grid min-h-0 grid-cols-[minmax(0,35%)_minmax(0,65%)] gap-4 overflow-hidden max-md:flex max-md:flex-1 max-md:flex-col max-md:overflow-visible">
        <div className="col-[1] flex min-h-0 min-w-0 flex-col overflow-hidden max-md:min-h-[400px] max-md:overflow-visible">
          <OrderBookDisplayContainer />
        </div>
        <div className="col-[2] flex min-h-0 min-w-0 flex-col overflow-hidden max-md:min-h-[400px] max-md:overflow-visible">
          <PriceChartContainer />
        </div>
      </main>

      <FooterContainer />
    </div>
  );
}
