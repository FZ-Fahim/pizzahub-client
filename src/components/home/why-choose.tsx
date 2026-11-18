'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Flame, Award, Clock, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

const PILLARS = [
  {
    icon: Flame,
    title: '450°C Stone Ovens',
    description:
      'Every pizza is baked on genuine lava stone or refractory brick ovens, producing an airy, blistered cornicione crust with leopard spotting.',
    badgeColor: 'bg-pizza-red/10 text-pizza-red border-pizza-red/20',
  },
  {
    icon: Award,
    title: 'Certified Master Chefs',
    description:
      'We curate independent pizzaiolos who adhere to 72-hour dough maturation, D.O.P. San Marzano tomatoes, and authentic buffalo mozzarella.',
    badgeColor: 'bg-pizza-crust/10 text-pizza-crust border-pizza-crust/20',
  },
  {
    icon: Clock,
    title: 'Scheduled Fresh Booking',
    description:
      'Pick your exact delivery date in advance. Chefs receive your booking early to prepare dedicated dough batches for optimal freshness.',
    badgeColor: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Stripe Secured Platform',
    description:
      'Enjoy 256-bit encrypted checkout, single-action vendor order confirmation, and trusted vendor audit ledgers backed by Stripe.',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function WhyChoose() {
  return (
    <section className="py-24 bg-muted/20 border-t border-border/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-pizza-red/30 bg-pizza-red/10 px-3.5 py-1 text-xs font-semibold text-pizza-red">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>The PizzaHub Difference</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Why Choose PizzaHub?
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            We are not another generic fast-food aggregator. We are an authentic marketplace
            dedicated exclusively to traditional and gourmet artisanal pizza mastery.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                variants={cardVariants}
                className="group relative flex flex-col rounded-3xl border border-border/80 bg-card p-7 shadow-sm hover:shadow-xl hover:border-pizza-red/40 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${pillar.badgeColor} shadow-sm group-hover:scale-110 transition-transform mb-6`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-bold text-foreground group-hover:text-pizza-red transition-colors">
                  {pillar.title}
                </h3>

                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChoose;
