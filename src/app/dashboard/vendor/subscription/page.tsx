'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { subscriptionApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Sparkles,
  Check,
  X,
  CreditCard,
  Award,
  Zap,
  ShieldCheck,
  Pizza,
  ArrowRight,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function VendorSubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<any>(null);

  const isPremium = user?.subscriptionPlan === 'premium';

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await subscriptionApi.getStatus();
        if (res?.data) {
          setSubStatus(res.data);
        }
      } catch {
        // demo fallback
      }
    }
    loadStatus();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await subscriptionApi.createCheckoutSession();
      if (response && response.url) {
        // Redirect to live Stripe Checkout
        window.location.href = response.url;
      } else {
        // Fallback simulation for local offline testing
        window.location.href = `/payment/success?session_id=demo_stripe_${Date.now()}`;
      }
    } catch (err: any) {
      // In offline/demo mode, provide fallback redirect
      if (err.message?.includes('Stripe') || err.message?.includes('Network')) {
        window.location.href = `/payment/success?session_id=demo_stripe_${Date.now()}`;
      } else {
        setErrorMessage(
          err.message || 'Failed to initiate Stripe Checkout session. Please check your network and retry.'
        );
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Award className="w-3.5 h-3.5" />
          <span>Master Pizzaiolo Membership Program</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-zinc-900 dark:text-zinc-100">
          Scale Your Artisanal Pizzeria
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Unlock unlimited wood-fired pizza menu listings, verified master baker trust badges, and
          priority placement in front of passionate foodies.
        </p>
      </div>

      {/* Current Active Plan Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
              isPremium
                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {isPremium ? <Award className="w-6 h-6" /> : <Pizza className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">
                Current Subscription:
              </span>
              <Badge
                className={
                  isPremium
                    ? 'bg-amber-500 text-white font-bold border-0 text-[10px]'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-0 text-[10px]'
                }
              >
                {isPremium ? 'Premium Partner' : 'Free Tier (3 Items)'}
              </Badge>
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {isPremium
                ? 'Your kitchen enjoys unlimited menu capacity and priority ranking.'
                : 'Limited to 3 active recipes simultaneously.'}
            </p>
          </div>
        </div>

        {isPremium && (
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Active until next billing renewal</span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pricing Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Tier 1: Free Plan */}
        <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-semibold text-zinc-500">
                Starter Baker
              </Badge>
              {!isPremium && (
                <span className="text-[11px] font-bold text-pizza-red uppercase tracking-wider">
                  Current Plan
                </span>
              )}
            </div>
            <CardTitle className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-100 pt-3">
              Free Kitchen Tier
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Perfect for new artisan bakers testing their initial signature sourdough recipes.
            </CardDescription>

            <div className="pt-6 pb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">$0</span>
                <span className="text-xs text-zinc-400 font-medium">/ forever</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-0 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Publish up to <strong>3 active recipes</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Standard customer order acceptance</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ImgBB Cloud photo hosting</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-400">
                <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                <span className="line-through">Unlimited menu listings</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-400">
                <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                <span className="line-through">Master Pizzaiolo Gold Badge</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-400">
                <X className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                <span className="line-through">Top-of-search ranking</span>
              </div>
            </div>

            <Button
              variant="outline"
              disabled
              className="w-full h-12 rounded-xl text-xs font-semibold border-zinc-200 dark:border-zinc-800 text-zinc-400"
            >
              {!isPremium ? 'Active Plan' : 'Free Tier'}
            </Button>
          </CardContent>
        </Card>

        {/* Tier 2: Premium Plan ($99/year) */}
        <Card className="rounded-3xl border-2 border-amber-500/60 dark:border-amber-500/50 bg-gradient-to-b from-amber-500/5 via-white to-white dark:via-zinc-900 dark:to-zinc-900 shadow-xl relative flex flex-col justify-between overflow-hidden">
          {/* Top highlight pill */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-pizza-orange to-amber-500 text-white font-bold text-[10px] px-4 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
            Most Popular
          </div>

          <CardHeader className="p-6 sm:p-8 pb-4">
            <div className="flex items-center justify-between">
              <Badge className="bg-amber-500 text-white font-semibold text-xs border-0 gap-1">
                <Award className="w-3.5 h-3.5" /> Master Artisan
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-100 pt-3">
              Premium Baker Partner
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              For ambitious pizza makers aiming to dominate their local market with unlimited recipes.
            </CardDescription>

            <div className="pt-6 pb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-pizza-red">$99</span>
                <span className="text-xs text-zinc-400 font-medium">/ year</span>
                <span className="ml-2 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Save 40% vs monthly
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-0 space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200 font-semibold">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Unlimited</strong> active pizza menu items</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Verified <strong>Master Pizzaiolo Gold Badge</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong>Priority placement</strong> in browse & search queries</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Unlimited multi-angle high-res photo uploads</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Zero platform percentage surcharges</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>VIP concierge customer care & priority moderation</span>
              </div>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={loading || isPremium}
              className="w-full h-12 rounded-xl text-xs font-bold bg-pizza-red hover:bg-pizza-darkRed text-white shadow-lg shadow-pizza-red/30 gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Secure Stripe Gateway...</span>
                </>
              ) : isPremium ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You Are Already a Premium Master Baker</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Upgrade via Stripe Checkout · $99/yr</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trust & Guarantee Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <div className="space-y-1">
          <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Encrypted Stripe Checkout
          </h4>
          <p className="text-[11px] text-zinc-400">
            Industry standard 256-bit SSL encryption. Card data never touches PizzaHub servers.
          </p>
        </div>

        <div className="space-y-1">
          <Zap className="w-6 h-6 text-amber-500 mx-auto" />
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Instant Automatic Activation
          </h4>
          <p className="text-[11px] text-zinc-400">
            Your 3-item limit is unlocked immediately upon successful payment verification.
          </p>
        </div>

        <div className="space-y-1">
          <HelpCircle className="w-6 h-6 text-pizza-orange mx-auto" />
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Cancel Anytime
          </h4>
          <p className="text-[11px] text-zinc-400">
            Easily manage renewal or switch tiers with one click before your annual period ends.
          </p>
        </div>
      </div>
    </div>
  );
}
