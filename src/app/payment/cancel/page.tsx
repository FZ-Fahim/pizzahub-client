'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { XCircle, ArrowLeft, RefreshCw, Pizza, ShieldAlert } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mx-auto flex items-center justify-center">
          <XCircle className="w-8 h-8 text-zinc-400" />
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="text-zinc-500 text-xs">
            Checkout Incomplete
          </Badge>
          <h1 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
            Payment Cancelled
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            You were not charged. Your kitchen remains on the Free Plan with 3 active recipe slots.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-left space-y-2">
          <p>
            You can upgrade to the Master Pizzaiolo Premium Plan ($99/yr) whenever your kitchen is
            ready to scale menu capacity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/dashboard/vendor/subscription" className="flex-1">
            <Button className="w-full bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold h-11 shadow-sm gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Upgrade</span>
            </Button>
          </Link>

          <Link href="/dashboard/vendor" className="flex-1">
            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-medium h-11 border-zinc-300 dark:border-zinc-700"
            >
              <span>Return to Deck</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
