'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pizza,
  LayoutDashboard,
  UtensilsCrossed,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  CreditCard,
  ExternalLink,
  ChevronRight,
  Store,
  Award,
} from 'lucide-react';

export function VendorSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isPremium = user?.subscriptionPlan === 'premium';
  const vendorBusiness = user?.businessName || user?.name || 'Artisanal Pizzeria';

  const navItems = [
    {
      title: 'Kitchen Overview & Menu',
      href: '/dashboard/vendor',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Add New Pizza Recipe',
      href: '/dashboard/vendor/menu/new',
      icon: PlusCircle,
    },
    {
      title: 'Customer Orders Queue',
      href: '/dashboard/vendor/orders',
      icon: ShoppingBag,
    },
    {
      title: 'Artisan Subscription',
      href: '/dashboard/vendor/subscription',
      icon: CreditCard,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Vendor Profile Pill */}
      <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pizza-orange/10 border border-pizza-orange/20 flex items-center justify-center font-bold text-pizza-red text-base shrink-0">
            {vendorBusiness.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {vendorBusiness}
            </h3>
            <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Subscription Tier Pill */}
        <div className="pt-1">
          {isPremium ? (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Premium Artisan</span>
              </div>
              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 border-0">
                Unlimited
              </Badge>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-600 dark:text-zinc-300">Free Tier</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Max 3 Items
                </Badge>
              </div>
              <Link href="/dashboard/vendor/subscription" className="block">
                <Button
                  size="sm"
                  className="w-full h-8 text-xs font-bold bg-pizza-red hover:bg-pizza-darkRed text-white rounded-lg shadow-sm transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" /> Upgrade $99/yr
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1">
          Kitchen Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-pizza-red text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.title}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer shortcut to public menu */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/menu"
          className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-pizza-orange" />
            <span>View Public Storefront</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}

export default VendorSidebar;
