'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Search, CalendarCheck, Flame, Utensils, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    number: '01',
    title: 'Explore Local Pizzerias',
    description:
      'Search curated artisanal menus across your city. Filter by classic, vegetarian, or specialty gourmet pizzas and check vendor badges.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Select Date & Address',
    description:
      'Choose your preferred delivery date, specify delivery instructions, and submit your order directly to the local pizzaiolo.',
    icon: CalendarCheck,
  },
  {
    number: '03',
    title: 'Stone Oven Handcrafting',
    description:
      'The vendor reviews and accepts your booking. Sourdough dough is stretched, toppings added, and baked at 450°C in minutes.',
    icon: Flame,
  },
  {
    number: '04',
    title: 'Fresh & Steaming Delivery',
    description:
      'Receive your pizza fresh out of the stone oven with blistered crust, melted cheese, and aromatic fresh herbs ready to enjoy.',
    icon: Utensils,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pizza-crust/30 bg-pizza-crust/10 px-3.5 py-1 text-xs font-semibold text-pizza-crust">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Effortless 4-Step Journey</span>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            How PizzaHub Works
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed">
            From the stone oven hearth straight to your dining table in four seamless steps.
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                className="relative flex flex-col items-start rounded-3xl border border-border/80 bg-card p-7 shadow-sm hover:border-pizza-red/40 transition-all duration-300"
              >
                {/* Step Number Watermark */}
                <span className="text-4xl font-black text-muted/60 select-none">
                  {step.number}
                </span>

                {/* Step Icon */}
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pizza-red/10 text-pizza-red border border-pizza-red/20">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Button asChild size="lg" variant="pizza" className="shadow-lg shadow-pizza-red/20">
            <Link href="/menu">
              Start Your Pizza Order Now
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
