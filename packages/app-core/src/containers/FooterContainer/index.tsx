import React, { useEffect, useState } from 'react';
import type { Subscription } from 'rxjs';
import { subscribeToBalances } from '../../services/kraken-ws-service';
import { toError } from '../../utils/error-utils';
import './styles.css';

type Tab = 'balances' | 'orders' | 'trades';

export function FooterContainer() {
  const [activeTab, setActiveTab] = useState<Tab>('balances');

  // TODO: move subscription to business layer
  useEffect(() => {
    let subscription: Subscription | null = null;

    subscription = subscribeToBalances().subscribe({
      next: (update) => {
        // if (!isMounted) return;
        console.log('Balances update:', update);
      },
      error: (err) => {
        // if (!isMounted) return;
        const error = toError(err);
        console.error('Balances error:', error);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <footer className="FooterContainer">
      <div className="FooterContainer__tabs">
        <button
          className={`FooterContainer__tab ${activeTab === 'balances' ? 'FooterContainer__tab--active' : ''}`}
          onClick={() => {
            setActiveTab('balances');
          }}
        >
          Balances
        </button>
      </div>
      <div className="FooterContainer__content">
        {activeTab === 'balances' && (
          <div>
            <p>Balances content goes here</p>
          </div>
        )}
      </div>
    </footer>
  );
}
