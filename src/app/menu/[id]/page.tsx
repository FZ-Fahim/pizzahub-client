'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { menuApi } from '@/lib/api';
import { MenuItem, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pizza,
  MapPin,
  Clock,
  Flame,
  Wheat,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ShoppingBag,
  Star,
  CheckCircle2,
  AlertCircle,
  Share2,
  Heart,
  ChevronRight,
  Store,
  ChefHat,
  Award,
} from 'lucide-react';

// Fallback items in case backend is offline or ID is a mock ID
const FALLBACK_ITEMS: Record<string, MenuItem> = {
  m_1: {
    _id: 'm_1',
    itemName: 'Margherita Verace D.O.P.',
    category: 'Classic Pizzas',
    description:
      'True Neapolitan heritage pizza crafted with San Marzano tomatoes, fresh buffalo mozzarella from Campania, aromatic sweet basil leaves, and cold-pressed extra virgin olive oil over a 72-hour naturally fermented sourdough crust.',
    price: 18.5,
    location: 'Little Italy, NY',
    images: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000',
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
  m_2: {
    _id: 'm_2',
    itemName: 'Tartufo & Porcini Supreme',
    category: 'Specialty / Gourmet Pizzas',
    description:
      'Wild forest porcini mushrooms hand-picked in Tuscany, creamy fior di latte mozzarella, fragrant black summer truffle emulsion, and 24-month aged Parmigiano Reggiano shavings baked to golden perfection.',
    price: 24.0,
    location: 'Downtown Chicago, IL',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000',
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1000',
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
  m_3: {
    _id: 'm_3',
    itemName: 'Diavola Piccante & Nduja',
    category: 'Meat Lovers',
    description:
      'Spicy artisanal Calabrian soppressata, spreadable spicy nduja sausage, smoky provolone, San Marzano tomato reduction, and fresh wild oregano drizzled with hot chili-infused honey.',
    price: 21.0,
    location: 'North Beach, San Francisco',
    images: [
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1000',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000',
    ],
    status: 'approved',
    createdAt: new Date().toISOString(),
    vendorId: {
      _id: 'v_3',
      name: 'Marco Bellini',
      email: 'marco@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Bellini Artisanal Forno',
      subscriptionPlan: 'premium',
    },
  },
};

const DEFAULT_SAMPLE_ITEM: MenuItem = {
  _id: 'default_item',
  itemName: 'Artisanal Neapolitan Pizza',
  category: 'Classic Pizzas',
  description:
    'Wood-fired sourdough pizza, slowly fermented for 72 hours, dressed with organic crushed Italian tomatoes, fresh mozzarella, extra virgin olive oil, and sweet basil leaves.',
  price: 19.5,
  location: 'Naples Heritage Kitchen',
  images: [
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000',
  ],
  status: 'approved',
  createdAt: new Date().toISOString(),
  vendorId: {
    _id: 'v_default',
    name: 'Artisan Master',
    email: 'chef@pizzahub.com',
    role: 'vendor',
    isBlocked: false,
    businessName: 'Master Pizzaiolo Kitchen',
    subscriptionPlan: 'premium',
  },
};

// Ingredients extracted or derived from description
const getIngredients = (description: string): string[] => {
  const defaults = [
    '72h Sourdough Crust',
    'San Marzano Tomatoes D.O.P.',
    'Fior di Latte Mozzarella',
    'Fresh Sweet Basil',
    'Extra Virgin Olive Oil',
    'Flaky Sea Salt',
  ];

  const lower = description.toLowerCase();
  const matched: string[] = ['72h Fermented Crust'];

  if (lower.includes('tomato')) matched.push('San Marzano D.O.P. Tomatoes');
  if (lower.includes('mozzarella') || lower.includes('buffalo')) matched.push('Campania Buffalo Mozzarella');
  if (lower.includes('basil')) matched.push('Fresh Genovese Basil');
  if (lower.includes('truffle')) matched.push('Black Truffle Emulsion');
  if (lower.includes('porcini') || lower.includes('mushroom')) matched.push('Tuscan Porcini Mushrooms');
  if (lower.includes('parmigiano')) matched.push('24-Month Aged Parmigiano');
  if (lower.includes('nduja') || lower.includes('soppressata') || lower.includes('meat')) matched.push('Calabrian Spicy Nduja');
  if (lower.includes('honey')) matched.push('Hot Chili Honey');
  matched.push('Cold Pressed Extra Virgin Olive Oil');

  return matched.length >= 4 ? matched : defaults;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MenuItemDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Unwrap async params in Next.js 15
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [orderModalNotice, setOrderModalNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const response = await menuApi.getItemById(itemId);
        if (response && response.data) {
          setItem(response.data);
        } else if (FALLBACK_ITEMS[itemId]) {
          setItem(FALLBACK_ITEMS[itemId]);
        } else {
          setItem({ ...DEFAULT_SAMPLE_ITEM, _id: itemId });
        }
      } catch (err) {
        // Fallback gracefully on local/demo mode
        if (FALLBACK_ITEMS[itemId]) {
          setItem(FALLBACK_ITEMS[itemId]);
        } else {
          setItem({ ...DEFAULT_SAMPLE_ITEM, _id: itemId });
        }
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [itemId]);

  // Gallery images with guaranteed multi-angle views
  const displayImages = React.useMemo(() => {
    if (!item || !item.images || item.images.length === 0) {
      return [
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000',
      ];
    }
    if (item.images.length === 1) {
      return [
        item.images[0],
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000',
      ];
    }
    return item.images;
  }, [item]);

  const vendorObj = typeof item?.vendorId === 'object' ? (item.vendorId as User) : null;
  const isPremiumVendor = vendorObj?.subscriptionPlan === 'premium';
  const vendorName = vendorObj?.businessName || vendorObj?.name || 'Artisanal Pizzeria';

  // Handle Order CTA with comprehensive Role Guards
  const handleOrderClick = () => {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/menu/${itemId}`);
      return;
    }

    if (user?.role === 'vendor') {
      setOrderModalNotice(
        'Vendors cannot place orders. Please switch to or register a Customer account to order from other artisans.'
      );
      return;
    }

    if (user?.role === 'admin') {
      setOrderModalNotice('Administrators cannot place customer orders.');
      return;
    }

    // Customer is authenticated: ready for Phase C15 Order Modal
    setOrderModalNotice(
      `Order ready! Ordering ${quantity}x "${item?.itemName}". Order submission modal will connect in Phase C15.`
    );
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pizza-warm-cream/30 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-6 w-48 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <div className="flex gap-3">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <Skeleton className="h-20 w-20 rounded-xl" />
                <Skeleton className="h-20 w-20 rounded-xl" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4 rounded-lg" />
              <Skeleton className="h-6 w-1/3 rounded-lg" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-pizza-red/10 rounded-full flex items-center justify-center text-pizza-red mb-4">
          <Pizza className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-100 mb-2">
          Pizza Not Found
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
          The artisanal pizza recipe you are looking for may have been archived or removed by the baker.
        </p>
        <Link href="/menu">
          <Button className="bg-pizza-red hover:bg-pizza-red/90 text-white font-medium rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Full Menu
          </Button>
        </Link>
      </div>
    );
  }

  const ingredients = getIngredients(item.description);

  return (
    <div className="min-h-screen bg-pizza-warm-cream/30 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-pizza-red transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/menu" className="hover:text-pizza-red transition-colors">
            Artisanal Menu
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-900 dark:text-zinc-100 font-medium truncate max-w-[200px] sm:max-w-none">
            {item.itemName}
          </span>
        </nav>

        {/* Notice/Alert Modal Toast */}
        <AnimatePresence>
          {orderModalNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-lg ${
                user?.role === 'vendor' || user?.role === 'admin'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {user?.role === 'vendor' || user?.role === 'admin' ? (
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                )}
                <p className="text-sm font-medium">{orderModalNotice}</p>
              </div>
              <button
                onClick={() => setOrderModalNotice(null)}
                className="text-xs font-semibold underline hover:no-underline shrink-0"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Product Showcase Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Multi-Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image */}
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={displayImages[activeImageIndex]}
                  alt={`${item.itemName} view ${activeImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover object-center"
                />
              </AnimatePresence>

              {/* Status and Category Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <Badge className="bg-pizza-red text-white font-medium shadow-md border-0">
                  {item.category}
                </Badge>
                {isPremiumVendor && (
                  <Badge className="bg-amber-500 text-white font-medium shadow-md border-0 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Master Artisan
                  </Badge>
                )}
              </div>

              {/* Floating Action Icons */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={handleShare}
                  aria-label="Share recipe"
                  className="w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-700 dark:text-zinc-200 flex items-center justify-center hover:text-pizza-red transition-all shadow-md active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  aria-label="Save to favorites"
                  className={`w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-95 ${
                    isLiked
                      ? 'text-pizza-red fill-pizza-red'
                      : 'text-zinc-700 dark:text-zinc-200 hover:text-pizza-red'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {isCopied && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
                  Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Interactive Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-pizza-orange shadow-md ring-2 ring-pizza-orange/30 scale-102'
                        : 'border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Artisanal Baking Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center text-center">
                <Wheat className="w-5 h-5 text-pizza-orange mb-1" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Fermentation</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">72 Hours</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center text-center">
                <Flame className="w-5 h-5 text-pizza-red mb-1" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Oven Fire</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">450°C Stone</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Bake Time</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">90 Seconds</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center text-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Certification</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">D.O.P. Grade</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Pricing & Order Action */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-pizza-red mb-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{item.location || 'Artisanal Forno, Italy'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100 tracking-tight">
                {item.itemName}
              </h1>
            </div>

            {/* Price & Rating Highlights */}
            <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-medium">
                  Artisanal Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-pizza-red">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    / 12-inch stone-baked
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full font-semibold text-sm">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>4.95</span>
                <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">(42)</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Pizzaiolo Tasting Notes
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {item.description}
              </p>
            </div>

            {/* Artisanal Ingredients Chips */}
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-pizza-orange" />
                Selected Ingredients
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Master Pizzaiolo / Vendor Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-pizza-orange" />
                  Baked by Master Artisan
                </span>
                {isPremiumVendor && (
                  <Badge variant="outline" className="text-amber-600 border-amber-500/40 text-[10px] gap-1">
                    <Award className="w-3 h-3 text-amber-500" /> Premium Vendor
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-pizza-orange/10 border border-pizza-orange/20 flex items-center justify-center font-bold text-pizza-red text-base shrink-0">
                  {vendorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate flex items-center gap-1.5">
                    {vendorName}
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {vendorObj?.email || 'verified.vendor@pizzahub.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Live Total */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Quantity (Pizzas)
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Role Guard Warning if logged in as Vendor or Admin */}
            {isAuthenticated && user?.role !== 'customer' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {user?.role === 'vendor'
                    ? 'You are signed in as a Vendor. Vendors manage menus and orders; to place orders, please switch to a customer account.'
                    : 'Administrators have platform moderation permissions and cannot place consumer orders.'}
                </span>
              </div>
            )}

            {/* Primary Order Action Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleOrderClick}
                disabled={user?.role === 'vendor' || user?.role === 'admin'}
                className="w-full h-13 text-base font-bold bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl shadow-lg shadow-pizza-red/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {!isAuthenticated
                    ? 'Sign In to Order Pizza'
                    : user?.role === 'vendor'
                    ? 'Vendor Account (Orders Disabled)'
                    : user?.role === 'admin'
                    ? 'Admin Account (Orders Disabled)'
                    : `Order Now · $${(item.price * quantity).toFixed(2)}`}
                </span>
              </Button>

              <div className="flex items-center justify-center gap-6 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Fresh Guarantee
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Direct Baker Dispatch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Recommendation: More from Artisanal Kitchens */}
        <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
                You May Also Relish
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Complementary wood-fired artisan pies from our master bakers.
              </p>
            </div>
            <Link href="/menu">
              <Button variant="outline" size="sm" className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs">
                View All Menu <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(FALLBACK_ITEMS)
              .filter((rec) => rec._id !== itemId)
              .slice(0, 3)
              .map((rec) => (
                <Link
                  key={rec._id}
                  href={`/menu/${rec._id}`}
                  className="group block rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-zinc-900">
                    <img
                      src={rec.images[0]}
                      alt={rec.itemName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-zinc-900/80 backdrop-blur-sm text-white text-[10px] border-0">
                      {rec.category}
                    </Badge>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-pizza-red transition-colors">
                        {rec.itemName}
                      </h3>
                      <span className="font-bold text-sm text-pizza-red">
                        ${rec.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
