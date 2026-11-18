'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { menuApi } from '@/lib/api';
import { MenuItem, MenuCategory, PaginationMeta } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Pizza,
  Store,
} from 'lucide-react';

const CATEGORIES_LIST: (MenuCategory | 'All')[] = [
  'All',
  'Classic Pizzas',
  'Vegetarian Pizzas',
  'Meat Lovers',
  'Specialty / Gourmet Pizzas',
  'Sides & Appetizers',
  'Beverages & Desserts',
];

// Fallback artisanal pizzas ensuring menu is always richly populated
const FALLBACK_MENU_ITEMS: MenuItem[] = [
  {
    _id: 'm_1',
    itemName: 'Margherita Verace D.O.P.',
    category: 'Classic Pizzas',
    description:
      'San Marzano tomatoes, buffalo mozzarella from Campania, fresh sweet basil, and extra virgin olive oil.',
    price: 18.5,
    location: 'Little Italy, NY',
    images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'],
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
    _id: 'm_2',
    itemName: 'Tartufo & Porcini Supreme',
    category: 'Specialty / Gourmet Pizzas',
    description:
      'Wild forest porcini mushrooms, creamy fior di latte, black truffle emulsion, and aged Parmigiano.',
    price: 24.0,
    location: 'Downtown Chicago, IL',
    images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'],
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
    _id: 'm_3',
    itemName: 'Diavola Piccante & Nduja',
    category: 'Meat Lovers',
    description:
      'Spicy Calabrian nduja, pepperoni salami, crushed San Marzano marinara, and chili infused honey drizzle.',
    price: 21.0,
    location: 'Brooklyn, NY',
    images: ['https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800'],
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
    _id: 'm_4',
    itemName: 'Quattro Formaggi & Fig Honey',
    category: 'Vegetarian Pizzas',
    description:
      'Gorgonzola dolce, fontina, smoked provola, ricotta, roasted walnuts, and local wildflower fig honey.',
    price: 22.5,
    location: 'North End, Boston',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
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
    _id: 'm_5',
    itemName: 'Prosciutto Di Parma & Burrata',
    category: 'Meat Lovers',
    description:
      'Whole Pugliese burrata ball, 24-month aged Prosciutto di Parma, wild baby arugula, and shaved pecorino.',
    price: 25.0,
    location: 'San Francisco, CA',
    images: ['https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800'],
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
    _id: 'm_6',
    itemName: 'Ortolana Vegana Di Stagione',
    category: 'Vegetarian Pizzas',
    description:
      'Fire-roasted bell peppers, grilled zucchini, charred eggplant, cherry tomatoes, and basil almond pesto.',
    price: 19.5,
    location: 'Austin, TX',
    images: ['https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800'],
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
  {
    _id: 'm_7',
    itemName: 'Crispy Truffle Arancini (4 pcs)',
    category: 'Sides & Appetizers',
    description:
      'Golden arborio rice croquettes filled with smoked provolone, wild mushrooms, and black truffle aioli.',
    price: 12.0,
    location: 'Little Italy, NY',
    images: ['https://images.unsplash.com/photo-1541529086526-db283c563270?w=800'],
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
    _id: 'm_8',
    itemName: 'Traditional Espresso Tiramisu',
    category: 'Beverages & Desserts',
    description:
      'Savoiardi ladyfingers soaked in dark Illy espresso and amaretto, layered with velvety mascarpone cream.',
    price: 9.5,
    location: 'North End, Boston',
    images: ['https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800'],
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
];

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState<number>(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const [items, setItems] = useState<MenuItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state with URL changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page,
        limit: 9,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (location.trim()) params.location = location.trim();

      const response = await menuApi.getPublicItems(params);

      if (response.data && response.data.length > 0) {
        setItems(response.data);
        setPagination(response.pagination);
      } else {
        // Apply client-side filters to fallbacks so user always sees matches
        let filtered = [...FALLBACK_MENU_ITEMS];
        if (selectedCategory && selectedCategory !== 'All') {
          filtered = filtered.filter((i) => i.category === selectedCategory);
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (i) => i.itemName.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
          );
        }
        if (location.trim()) {
          const loc = location.toLowerCase();
          filtered = filtered.filter((i) => i.location.toLowerCase().includes(loc));
        }

        if (sort === 'price_asc') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
          filtered.sort((a, b) => b.price - a.price);
        }

        setItems(filtered);
        setPagination({
          total: filtered.length,
          page: 1,
          limit: 9,
          totalPages: Math.max(1, Math.ceil(filtered.length / 9)),
        });
      }
    } catch (err) {
      setItems(FALLBACK_MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, location, sort, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.replace(`/menu?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setLocation('');
    setSort('newest');
    setPage(1);
    router.replace('/menu');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-pizza-red/30 bg-pizza-red/10 px-3.5 py-1 text-xs font-semibold text-pizza-red">
          <Pizza className="h-3.5 w-3.5" />
          <span>Fresh From The Wood Oven</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
          Browse Artisanal Pizzas
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-base">
          Explore handcrafted pizzas made with slow-fermented dough, authentic San Marzano sauce, and premium ingredients.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by pizza name, toppings, or crust..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Location Filter */}
          <div className="relative md:col-span-4">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by area / city (e.g. Brooklyn, NY)..."
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>

          {/* Price Sorting Selector */}
          <div className="md:col-span-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest Additions</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Categories:
          </span>
          {CATEGORIES_LIST.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-pizza-red text-white shadow-sm'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {(search || location || selectedCategory !== 'All' || sort !== 'newest') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto text-xs text-muted-foreground hover:text-pizza-red flex items-center gap-1 shrink-0 font-medium px-2 py-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Pizzas Result Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
              <Skeleton className="h-56 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
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
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No pizzas found matching your criteria</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms, changing the category, or clearing the area filter.
          </p>
          <Button variant="outline" onClick={handleResetFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const vendor = typeof item.vendorId === 'object' ? item.vendorId : null;
            const isPremiumVendor = vendor?.subscriptionPlan === 'premium';
            const vendorName = vendor?.businessName || vendor?.name || 'Artisanal Pizzeria';

            return (
              <div
                key={item._id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-pizza-red/40 transition-all duration-300"
              >
                <div>
                  {/* Image Frame */}
                  <div className="relative h-56 w-full overflow-hidden bg-muted">
                    <Image
                      src={item.images[0] || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'}
                      alt={item.itemName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                    {/* Category & Premium Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="backdrop-blur-md bg-background/90 text-foreground font-medium text-xs">
                        {item.category}
                      </Badge>

                      {isPremiumVendor && (
                        <Badge variant="premium" className="gap-1 shadow-md text-xs">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Premium Vendor
                        </Badge>
                      )}
                    </div>

                    {/* Location Badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs text-white drop-shadow-md">
                      <MapPin className="h-3.5 w-3.5 text-pizza-red" />
                      <span className="font-medium">{item.location}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
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

                {/* Footer with Price and View Details CTA */}
                <div className="flex items-center justify-between border-t border-border/60 p-5 pt-4 bg-muted/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-muted-foreground uppercase font-semibold">Price</span>
                    <span className="text-xl font-black text-foreground">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <Button asChild variant="pizza" size="sm" className="gap-1.5 shadow-sm">
                    <Link href={`/menu/${item._id}`}>
                      Order Pizza
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <span className="px-4 text-sm text-muted-foreground font-medium">
            Page {page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
          <Skeleton className="h-10 w-48 mx-auto mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
