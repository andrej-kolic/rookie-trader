import React from 'react';
import { useAuth } from '../hooks/use-auth';

type AuthGuardProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * AuthGuard Component
 *
 * Conditionally renders children based on authentication status.
 * If user is not authenticated, renders a fallback UI instead.
 *
 * @param children - Content to render when authenticated
 * @param fallback - Content to render when not authenticated (defaults to login message)
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>{fallback ?? <div>Please login to view this content</div>}</div>
    );
  }

  return <>{children}</>;
}
