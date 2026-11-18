'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { menuApi } from '@/lib/api';
import { MenuItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, MapPin, ArrowRight, Store, Pizza } from 'lucide-react';

// Curated Artisanal Fallbacks ensuring $\ge 6$ pizzas display immediately
const FALLBACK_FEATURED_ITEMS: MenuItem[] = [
  {
    _id: 'featured_1',
    itemName: 'Margherita Verace D.O.P.',
    category: 'Classic Pizzas',
    description:
      'San Marzano tomatoes, buffalo mozzarella from Campania, fresh basil, and extra virgin olive oil.',
    price: 18.5,
    location: 'Little Italy, NY',
    images: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop',
    ],
    status: 'approved',
    createdAt: new Date().toISOString(),
    vendorId: {
      _id: 'v_1',
      name: 'Gennaro Esposito',
      email: 'gennaro@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Antica Pizzeria Da Gennaro',
      subscriptionPlan: 'premium',
    },
  },
  {
    _id: 'featured_2',
    itemName: 'Tartufo & Porcini Supreme',
    category: 'Specialty / Gourmet Pizzas',
    description:
      'Wild forest porcini mushrooms, creamy fior di latte, black truffle emulsion, and aged Parmigiano.',
    price: 24.0,
    location: 'Downtown Chicago, IL',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop',
    ],
    status: 'approved',
    createdAt: new Date().toISOString(),
    vendorId: {
      _id: 'v_2',
      name: 'Matteo Ricci',
      email: 'matteo@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Truffle & Stone Pizzeria',
      subscriptionPlan: 'premium',
    },
  },
  {
    _id: 'featured_3',
    itemName: 'Diavola Piccante & Nduja',
    category: 'Meat Lovers',
    description:
      'Spicy Calabrian nduja, pepperoni salami, crushed San Marzano marinara, and chili infused honey drizzle.',
    price: 21.0,
    location: 'Brooklyn, NY',
    images: [
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop',
    ],
    status: 'approved',
    createdAt: new Date().toISOString(),
    vendorId: {
      _id: 'v_3',
      name: 'Vincenzo Bellini',
      email: 'vincenzo@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Bella Napoli Wood Fire',
      subscriptionPlan: 'free',
    },
  },
  {
    _id: 'featured_4',
    itemName: 'Quattro Formaggi & Fig Honey',
    category: 'Vegetarian Pizzas',
    description:
      'Gorgonzola dolce, fontina, smoked provola, ricotta, roasted walnuts, and local wildflower fig honey.',
    price: 22.5,
    location: 'North End, Boston',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    ],
    status: 'approved',
    createdAt: new Date().toISOString(),
    vendorId: {
      _id: 'v_4',
      name: 'Luigi Moretti',
      email: 'luigi@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Moretti Artisanal Hearth',
      subscriptionPlan: 'premium',
    },
  },
  {
    _id: 'featured_5',
    itemName: 'Prosciutto Di Parma & Burrata',
    category: 'Meat Lovers',
    description:
      'Whole Pugliese burrata ball, 24-month aged Prosciutto di Parma, wild baby arugula, and shaved pecorino.',
    price: 25.0,
    location: 'San Francisco, CA',
    images: [
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop',
    ],
    status: 'approved',
    createdAt: new Date().toISOString(),
    vendorId: {
      _id: 'v_5',
      name: 'Sofia Rossi',
      email: 'sofia@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Rustica Wood Fired Co.',
      subscriptionPlan: 'premium',
    },
  },
  {
    _id: 'featured_6',
    itemName: 'Ortolana Vegana Di Stagione',
    category: 'Vegetarian Pizzas',
    description:
      'Fire-roasted bell peppers, grilled zucchini, charred eggplant, cherry tomatoes, and basil almond pesto.',
    price: 19.5,
    location: 'Austin, TX',
    images: [
      'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop',
    ],
    status: 'approved',
    createdAt: new Date().toISOString(),
    vendorId: {
      _id: 'v_6',
      name: 'Marco Zanetti',
      email: 'marco@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Zanetti Organic Pizzeria',
      subscriptionPlan: 'free',
    },
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturedItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await menuApi.getPublicItems({ limit: 6, sort: 'newest' });
        if (res.data && res.data.length >= 6) {
          setItems(res.data);
        } else if (res.data && res.data.length > 0) {
          // Merge with fallbacks so minimum 6 items always display
          const combined = [...res.data, ...FALLBACK_FEATURED_ITEMS.slice(res.data.length)];
          setItems(combined.slice(0, 6));
        } else {
          setItems(FALLBACK_FEATURED_ITEMS);
        }
      } catch (err) {
        // Fallback gracefully on network/backend offline
        setItems(FALLBACK_FEATURED_ITEMS);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-pizza-red">
              <Pizza className="h-3.5 w-3.5" />
              <span>Oven Fresh Highlights</span>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Featured Artisanal Pizzas
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-xl">
              Hand-tossed masterpieces from our highest-rated wood-fired ovens and verified Master Pizzaiolos.
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/menu">
                View All Pizzas <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Dynamic Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <Skeleton className="h-56 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {items.map((item) => {
              const vendor = typeof item.vendorId === 'object' ? item.vendorId : null;
              const isPremiumVendor = vendor?.subscriptionPlan === 'premium';
              const vendorName = vendor?.businessName || vendor?.name || 'Artisanal Pizzeria';

              return (
                <motion.div
                  key={item._id}
                  variants={cardVariants}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-pizza-red/40 transition-all duration-300"
                >
                  <div>
                    {/* Pizza Image Frame */}
                    <div className="relative h-56 w-full overflow-hidden bg-muted">
                      <Image
                        src={item.images[0] || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'}
                        alt={item.itemName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="backdrop-blur-md bg-background/90 text-foreground font-medium text-xs">
                          {item.category}
                        </Badge>

                        {/* Premium Vendor Badge */}
                        {isPremiumVendor && (
                          <Badge variant="premium" className="gap-1 shadow-md text-xs">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            Premium Vendor
                          </Badge>
                        )}
                      </div>

                      {/* Location Chip */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white drop-shadow-md">
                        <MapPin className="h-3.5 w-3.5 text-pizza-red" />
                        <span className="font-medium">{item.location}</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      {/* Vendor Line */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1.5">
                        <Store className="h-3.5 w-3.5" />
                        <span className="truncate">{vendorName}</span>
                      </div>

                      <h3 className="text-xl font-bold text-foreground group-hover:text-pizza-red transition-colors line-clamp-1">
                        {item.itemName}
                      </h3>

                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Price & Action */}
                  <div className="flex items-center justify-between border-t border-border/60 p-5 pt-4 bg-muted/10">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">Price</span>
                      <span className="text-xl font-black text-foreground">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <Button asChild variant="pizza" size="sm" className="gap-1.5 shadow-sm">
                      <Link href={`/menu/${item._id}`}>
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default FeaturedItems;
