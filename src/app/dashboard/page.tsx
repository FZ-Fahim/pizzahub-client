'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/sign-in');
      } else if (user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (user.role === 'vendor') {
        router.replace('/dashboard/vendor');
      } else {
        router.replace('/dashboard/customer');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-pizza-red" />
      <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
}
