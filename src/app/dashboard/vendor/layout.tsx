'use client';

import React, { useState } from 'react';
import { ProtectedPage } from '@/components/auth/route-guards';
import { VendorSidebar } from '@/components/dashboard/vendor-sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ProtectedPage allowedRoles={['vendor']}>
      <div className="min-h-screen bg-pizza-warm-cream/30 dark:bg-zinc-950 flex flex-col">
        {/* Mobile Header with Menu Toggle */}
        <div className="lg:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
          <span className="font-serif font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Artisan Kitchen Portal
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="h-8 w-8 p-0 rounded-lg"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="w-72 bg-white dark:bg-zinc-900 h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <VendorSidebar />
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="hidden lg:block">
            <VendorSidebar />
          </div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </ProtectedPage>
  );
}
