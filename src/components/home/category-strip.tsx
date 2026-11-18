'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { Pizza, Leaf, Beef, Sparkles, UtensilsCrossed, Wine } from 'lucide-react';

export const CATEGORIES = [
  {
    name: 'Classic Pizzas',
    description: 'Neapolitan Margherita & Marinara',
    icon: Pizza,
    color: 'from-red-500/10 to-orange-500/10 text-pizza-red border-pizza-red/20',
  },
  {
    name: 'Vegetarian Pizzas',
    description: 'Farm-fresh veggies & buffalo mozzarella',
    icon: Leaf,
    color: 'from-green-500/10 to-emerald-500/10 text-green-600 border-green-500/20',
  },
  {
    name: 'Meat Lovers',
    description: 'Smoked prosciutto, diavola & sausage',
    icon: Beef,
    color: 'from-rose-500/10 to-red-600/10 text-rose-600 border-rose-500/20',
  },
  {
    name: 'Specialty / Gourmet Pizzas',
    description: 'Black truffle, burrata & pistachio pesto',
    icon: Sparkles,
    color: 'from-amber-500/10 to-yellow-500/10 text-amber-600 border-amber-500/20',
  },
  {
    name: 'Sides & Appetizers',
    description: 'Crispy arancini, focaccia & burrata bowls',
    icon: UtensilsCrossed,
    color: 'from-orange-500/10 to-amber-500/10 text-pizza-crust border-pizza-crust/20',
  },
  {
    name: 'Beverages & Desserts',
    description: 'Classic tiramisu, cannoli & Italian soda',
    icon: Wine,
    color: 'from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-500/20',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function CategoryStrip() {
  return (
    <section className="py-16 bg-muted/10 border-y border-border/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-pizza-red">
            Authentic Selections
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Explore by Pizza Categories
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            From centuries-old Neapolitan classics to modern culinary gourmet creations
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const queryCategory = encodeURIComponent(cat.name);

            return (
              <motion.div key={cat.name} variants={itemVariants}>
                <Link
                  href={`/menu?category=${queryCategory}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl border border-border/70 bg-card hover:border-pizza-red/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full justify-between"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} border shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-pizza-red transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default CategoryStrip;
