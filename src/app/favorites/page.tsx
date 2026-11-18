'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '@/context/favorites-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Pizza,
  ShoppingBag,
  Trash2,
  ArrowRight,
  MapPin,
  Sparkles,
  ChevronRight,
  Store,
} from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, removeFavorite, favoritesCount } = useFavorites();

  return (
    <div className="min-h-screen bg-pizza-warm-cream/30 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pizza-red mb-1">
              <Heart className="w-3.5 h-3.5 fill-current" /> Customer Wishlist
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-zinc-900 dark:text-zinc-100">
              My Saved Artisanal Pizzas
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Your personal tasting wishlist of hand-crafted wood-fired stone oven pies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-pizza-red/10 text-pizza-red border border-pizza-red/20 font-bold px-3 py-1.5 text-xs">
              {favoritesCount} {favoritesCount === 1 ? 'Pie Saved' : 'Pies Saved'}
            </Badge>
            <Link href="/menu">
              <Button
                variant="outline"
                className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs h-10 gap-1.5"
              >
                <span>Browse Menu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Wishlist Content */}
        {favorites.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-pizza-red/10 text-pizza-red flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
              Your Wishlist is Empty
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Save your favorite wood-fired pizzas while browsing our master baker menus so you can
              revisit and order them anytime.
            </p>
            <div className="pt-2">
              <Link href="/menu">
                <Button className="bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold h-11 px-6 shadow-md gap-2">
                  <Pizza className="w-4 h-4" />
                  <span>Explore Artisanal Catalog</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {favorites.map((item) => {
                const vendorObj = typeof item.vendorId === 'object' ? item.vendorId : null;
                const vendorName =
                  vendorObj?.businessName || vendorObj?.name || 'Artisan Pizzeria';

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between h-full">
                      <div className="relative aspect-16/10 overflow-hidden bg-zinc-900">
                        <img
                          src={
                            item.images[0] ||
                            'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600'
                          }
                          alt={item.itemName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-sm text-white text-[10px] border-0">
                          {item.category}
                        </Badge>
                        <button
                          onClick={() => removeFavorite(item._id)}
                          aria-label="Remove from favorites"
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-900/90 text-pizza-red hover:bg-rose-50 flex items-center justify-center shadow-md transition-all active:scale-95"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate group-hover:text-pizza-red transition-colors">
                              {item.itemName}
                            </h3>
                            <span className="font-extrabold text-base text-pizza-red shrink-0">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                            <Store className="w-3.5 h-3.5 text-pizza-orange shrink-0" />
                            <span className="truncate">{vendorName}</span>
                          </div>

                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                          <Link href={`/menu/${item._id}`} className="flex-1">
                            <Button className="w-full bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold h-10 gap-1.5 shadow-sm">
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Order Pizza</span>
                            </Button>
                          </Link>
                          <Link href={`/menu/${item._id}`}>
                            <Button
                              variant="outline"
                              className="rounded-xl border-zinc-200 dark:border-zinc-800 text-xs h-10 px-3"
                              title="View Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
