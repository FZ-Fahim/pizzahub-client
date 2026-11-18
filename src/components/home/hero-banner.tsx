'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  Star,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pizza-red/5 via-background to-background py-16 sm:py-24 lg:py-28">
      {/* Decorative ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-pizza-red/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 -z-10 h-96 w-96 rounded-full bg-pizza-amber/10 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline and Call-to-Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left"
          >
            {/* Pill Announcement */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 rounded-full border border-pizza-red/30 bg-pizza-red/10 px-4 py-1.5 text-xs font-semibold text-pizza-red shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>The Artisanal Multi-Vendor Pizza Marketplace</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.12]"
            >
              Authentic Wood-Fired{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pizza-red via-pizza-darkRed to-pizza-crust">
                Artisanal Pizzas
              </span>{' '}
              Delivered Fresh to Your Door.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
            >
              Discover signature recipes crafted by independent master pizzaiolos,
              fermented with 72-hour sourdough, baked at 450°C in traditional stone ovens,
              and delivered piping hot.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:justify-start"
            >
              <Button
                asChild
                size="lg"
                variant="pizza"
                className="group gap-2 text-base font-semibold shadow-lg shadow-pizza-red/25 hover:shadow-pizza-red/40 transition-all hover:scale-[1.02]"
              >
                <Link href="/menu">
                  Explore Menu
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base font-medium border-border/80 hover:bg-muted transition-all"
              >
                <Link href="/sign-up">Become a Vendor</Link>
              </Button>
            </motion.div>

            {/* Trust Highlights */}
            <motion.div
              variants={itemVariants}
              className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-8 text-left w-full max-w-lg"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-black text-foreground">72h</span>
                <span className="text-xs text-muted-foreground">Fermented Dough</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-foreground">450°C</span>
                <span className="text-xs text-muted-foreground">Wood Stone Oven</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-2xl font-black text-foreground">
                  4.9 <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-xs text-muted-foreground">15,000+ Reviews</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Visual Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="relative lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md sm:max-w-lg p-2 sm:p-4">
              {/* Outer Golden Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pizza-red/25 via-pizza-crust/25 to-pizza-amber/25 blur-2xl opacity-70" />

              {/* Main Pizza Card Container (overflow-visible allows floating badges to pop) */}
              <div className="relative rounded-3xl border border-border/80 bg-card p-3 shadow-2xl">
                <div className="relative h-80 w-full overflow-hidden rounded-2xl sm:h-96">
                  <Image
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop"
                    alt="Authentic wood-fired Neapolitan pizza with fresh basil and mozzarella"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Overlaid Pizza Details */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="inline-block rounded-full bg-pizza-red/90 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                      Chef Recommendation
                    </span>
                    <h3 className="mt-2 text-xl font-bold">Margherita Verace D.O.P.</h3>
                    <p className="text-xs text-gray-200">
                      San Marzano tomatoes, buffalo mozzarella, fresh basil, extra virgin olive oil.
                    </p>
                  </div>
                </div>

                {/* Floating Micro-Badges */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-4 -left-3 sm:-left-5 z-20 flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/95 px-3.5 py-2 shadow-xl backdrop-blur-md"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pizza-red text-white shadow-sm shadow-pizza-red/30">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="text-xs pr-1">
                    <p className="font-bold text-foreground">Wood-Fired</p>
                    <p className="text-[10px] text-muted-foreground">Stone Oven 450°C</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -right-3 sm:-right-5 z-20 flex items-center gap-2.5 rounded-2xl border border-border/80 bg-background/95 px-3.5 py-2 shadow-xl backdrop-blur-md"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm shadow-green-600/30">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="text-xs pr-1">
                    <p className="font-bold text-foreground">Fresh Dispatch</p>
                    <p className="text-[10px] text-muted-foreground">Scheduled Booking</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
