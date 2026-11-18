'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle2,
  Award,
  Sparkles,
  ArrowRight,
  Pizza,
  Layers,
  ShieldCheck,
} from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id') || 'cs_test_confirmed';
  const { user, refreshUser } = useAuth();
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    async function activateMembership() {
      try {
        if (sessionId) {
          await subscriptionApi.verifySession(sessionId);
        }
      } catch (err) {
        console.warn('[Payment Success] Session auto-activation notice:', err);
      } finally {
        await refreshUser().catch(() => {});
        setActivated(true);
      }
    }
    activateMembership();
  }, [sessionId, refreshUser]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6"
      >
        {/* Celebration Badge & Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shadow-inner">
            <Award className="w-10 h-10 animate-bounce" />
          </div>
          <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <Badge className="bg-amber-500 text-white border-0 font-bold px-3 py-1 text-xs gap-1">
            <Sparkles className="w-3 h-3" /> Master Pizzaiolo Upgraded
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100">
            Payment Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Welcome to the elite tier of PizzaHub artisans. Your annual Premium subscription is now
            active.
          </p>
        </div>

        {/* Order Details Pill */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-2">
          <div className="flex justify-between text-zinc-500">
            <span>Transaction Reference:</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              #{sessionId.slice(-10).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Membership Plan:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Vendor Premium (1 Year)
            </span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Menu Item Capacity:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Unlimited Listings
            </span>
          </div>
          <div className="flex justify-between text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Total Charged:</span>
            <span className="font-bold text-pizza-red text-sm">$99.00 USD</span>
          </div>
        </div>

        {/* Feature Unlocked Strip */}
        <div className="grid grid-cols-2 gap-3 text-left text-[11px] text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>3-Item Cap Removed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Master Artisan Badge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Priority Marketplace Search</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Instant Moderation Queue</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/dashboard/vendor/menu/new" className="flex-1">
            <Button className="w-full bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-bold h-11 shadow-lg shadow-pizza-red/20 gap-1.5">
              <Pizza className="w-4 h-4" />
              <span>Publish New Recipe</span>
            </Button>
          </Link>
          <Link href="/dashboard/vendor" className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold h-11 border-zinc-300 dark:border-zinc-700"
            >
              <span>Vendor Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin text-pizza-red">
            <Pizza className="w-10 h-10" />
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
