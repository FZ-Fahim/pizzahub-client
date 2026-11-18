'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { UserRole } from '@/types';
import { Pizza, ShieldAlert, Loader2, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/sign-in?from=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pizza-red/10 text-pizza-red animate-pulse">
          <Pizza className="h-8 w-8 animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying PizzaHub session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-pizza-red" />
        <p className="text-sm text-muted-foreground">Checking security permissions...</p>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Access Restricted</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This portal requires one of the following permissions:{' '}
          <span className="font-semibold text-foreground">[{allowedRoles.join(', ')}]</span>.
          Your current account role is{' '}
          <span className="font-semibold text-pizza-red uppercase">{user?.role || 'Guest'}</span>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button variant="pizza" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" /> Home Page
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface BlockedGuardProps {
  children: React.ReactNode;
}

export function BlockedGuard({ children }: BlockedGuardProps) {
  const { user, logout } = useAuth();

  if (user?.isBlocked) {
    return (
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-destructive mb-4">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-destructive">Account Suspended</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Your PizzaHub account has been suspended due to policy violations or review restrictions.
          Please contact our support team at{' '}
          <a href="mailto:support@pizzahub.com" className="font-semibold text-pizza-red underline">
            support@pizzahub.com
          </a>{' '}
          to appeal this decision.
        </p>
        <div className="mt-6">
          <Button variant="outline" onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface ProtectedPageProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export function ProtectedPage({ allowedRoles, children }: ProtectedPageProps) {
  return (
    <AuthGuard>
      <BlockedGuard>
        {allowedRoles && allowedRoles.length > 0 ? (
          <RoleGuard allowedRoles={allowedRoles}>{children}</RoleGuard>
        ) : (
          children
        )}
      </BlockedGuard>
    </AuthGuard>
  );
}

export default ProtectedPage;
