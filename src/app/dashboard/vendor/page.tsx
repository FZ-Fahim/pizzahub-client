'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { menuApi, orderApi } from '@/lib/api';
import { MenuItem, Order, MenuItemStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Pizza,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Flame,
  DollarSign,
  Layers,
  ChevronRight,
  Loader2,
  MapPin,
  ExternalLink,
} from 'lucide-react';

// Demo fallback items for brand-new vendor accounts
const DEMO_VENDOR_ITEMS: MenuItem[] = [
  {
    _id: 'm_vendor_1',
    itemName: 'Margherita Verace D.O.P.',
    category: 'Classic Pizzas',
    description: 'Campania buffalo mozzarella, San Marzano tomatoes, and extra virgin olive oil.',
    price: 18.5,
    location: 'Little Italy, NY',
    images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'],
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    vendorId: 'v_me',
  },
  {
    _id: 'm_vendor_2',
    itemName: 'Tartufo & Porcini Supreme',
    category: 'Specialty / Gourmet Pizzas',
    description: 'Wild forest porcini mushrooms, fior di latte, and shaved black truffle emulsion.',
    price: 24.0,
    location: 'Downtown Chicago, IL',
    images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'],
    status: 'approved',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    vendorId: 'v_me',
  },
  {
    _id: 'm_vendor_3',
    itemName: 'Calzone Ripieno Tradizionale',
    category: 'Classic Pizzas',
    description: 'Folded pizza pocket stuffed with ricotta, prosciutto cotto, and provolone.',
    price: 17.0,
    location: 'Naples Heritage Kitchen',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
    status: 'inactive',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    vendorId: 'v_me',
  },
];

export default function VendorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const isPremium = user?.subscriptionPlan === 'premium';
  const vendorBusiness = user?.businessName || user?.name || 'Artisanal Pizzeria';

  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Delete Dialog state
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Status toggle state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch vendor items
      let loadedItems: MenuItem[] = [];
      try {
        const itemRes = await menuApi.getVendorItems();
        if (itemRes && itemRes.data && Array.isArray(itemRes.data)) {
          loadedItems = itemRes.data;
        }
      } catch (e) {
        // Fallback
      }

      // Merge local newly added items from session storage if any
      if (typeof window !== 'undefined') {
        try {
          const rawLocal = localStorage.getItem('pizzahub_vendor_items');
          if (rawLocal) {
            const localList: MenuItem[] = JSON.parse(rawLocal);
            const idMap = new Map<string, MenuItem>();
            [...localList, ...loadedItems].forEach((it) => idMap.set(it._id, it));
            loadedItems = Array.from(idMap.values());
          }
        } catch {
          // ignore
        }
      }

      if (loadedItems.length === 0) {
        loadedItems = DEMO_VENDOR_ITEMS;
      }

      setItems(loadedItems);

      // 2. Fetch vendor orders
      try {
        const orderRes = await orderApi.getVendorOrders();
        if (orderRes && orderRes.data && Array.isArray(orderRes.data)) {
          setOrders(orderRes.data);
        }
      } catch (e) {
        // offline orders fallback
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const activeItemsCount = useMemo(() => {
    return items.filter((item) => item.status !== 'inactive').length;
  }, [items]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

  const acceptedOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'accepted').length;
  }, [orders]);

  const estimatedRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status === 'accepted')
      .reduce((sum, curr) => {
        const p = typeof curr.itemId === 'object' ? curr.itemId.price || 0 : 0;
        return sum + p;
      }, 0);
  }, [orders]);

  // Toggle active/inactive status with Free-tier 3 items rule
  const handleToggleStatus = async (item: MenuItem) => {
    setTogglingId(item._id);
    setBannerNotice(null);

    const isCurrentlyInactive = item.status === 'inactive';
    const targetStatus: MenuItemStatus = isCurrentlyInactive ? 'approved' : 'inactive';

    // Free Tier Guard Check: If activating and already at 3 active items
    if (isCurrentlyInactive && !isPremium && activeItemsCount >= 3) {
      setBannerNotice(
        'Free Plan limit reached! You already have 3 active recipes. Upgrade to Premium for unlimited publishing.'
      );
      setTogglingId(null);
      return;
    }

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(item._id);
      if (isMongoId) {
        await menuApi.updateItem(item._id, { status: targetStatus });
      }

      // Update state
      const updatedList = items.map((it) =>
        it._id === item._id ? { ...it, status: targetStatus } : it
      );
      setItems(updatedList);

      // Update local storage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('pizzahub_vendor_items', JSON.stringify(updatedList));
      }

      setBannerNotice(
        `Recipe "${item.itemName}" is now ${
          targetStatus === 'inactive' ? 'hidden (inactive)' : 'active and live'
        }.`
      );
    } catch (err: any) {
      setBannerNotice(err.message || 'Failed to update recipe visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete item handler
  const confirmDelete = async () => {
    if (!deletingItemId) return;

    setIsDeleting(true);
    setBannerNotice(null);

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(deletingItemId);
      if (isMongoId) {
        await menuApi.deleteItem(deletingItemId);
      }

      const updated = items.filter((it) => it._id !== deletingItemId);
      setItems(updated);

      if (typeof window !== 'undefined') {
        localStorage.setItem('pizzahub_vendor_items', JSON.stringify(updated));
      }

      setBannerNotice('Recipe successfully removed from kitchen catalog.');
      setDeletingItemId(null);
    } catch (err: any) {
      setBannerNotice(err.message || 'Failed to delete menu item.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (selectedStatusTab === 'active' && item.status === 'inactive') return false;
      if (selectedStatusTab === 'inactive' && item.status !== 'inactive') return false;
      if (selectedStatusTab === 'pending' && item.status !== 'pending') return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.itemName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [items, selectedStatusTab, searchQuery]);

  // Helper status badge
  const renderStatusBadge = (status: MenuItemStatus) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active & Live
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> In Moderation
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30 text-[10px] gap-1">
            <EyeOff className="w-3 h-3 text-zinc-500" /> Inactive (Hidden)
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] gap-1">
            <XCircle className="w-3 h-3 text-rose-500" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pizza-red mb-1">
            <Pizza className="w-3.5 h-3.5" /> Master Pizzaiolo Control Deck
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-zinc-900 dark:text-zinc-100">
            {vendorBusiness}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your wood-fired recipes, oven availability, and kitchen dispatch queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs gap-1.5 h-10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/dashboard/vendor/menu/new">
            <Button className="bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold gap-1.5 h-10 shadow-md">
              <PlusCircle className="w-4 h-4" />
              <span>Add New Recipe</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notice Banner */}
      <AnimatePresence>
        {bannerNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-md ${
              bannerNotice.includes('limit reached') || bannerNotice.includes('Failed')
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              {bannerNotice.includes('limit reached') ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{bannerNotice}</span>
            </div>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-xs font-semibold underline hover:no-underline shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free Tier Limit Progress Banner */}
      {!isPremium && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Free Plan Item Quota: {activeItemsCount} / 3 Active Recipes Used</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Free accounts can publish up to 3 active menu items simultaneously. Upgrade to
              Premium for unlimited recipes, verified master badge, and top search placement.
            </p>
          </div>
          <Link href="/dashboard/vendor/subscription" className="shrink-0">
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
            >
              Upgrade to Premium ($99/yr) <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Active Items */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Recipes</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                {loading ? <Skeleton className="h-8 w-12" /> : activeItemsCount}
                {!isPremium && <span className="text-sm text-zinc-400 font-normal"> / 3</span>}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5 block">
                {isPremium ? 'Unlimited catalog' : 'Free tier capacity'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pizza-orange/10 text-pizza-orange flex items-center justify-center shrink-0">
              <Pizza className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Incoming Orders */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Incoming Orders
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-600 dark:text-amber-400 mt-1">
                {loading ? <Skeleton className="h-8 w-12" /> : pendingOrdersCount}
              </h3>
              <Link
                href="/dashboard/vendor/orders"
                className="text-[11px] text-pizza-red hover:underline font-medium mt-0.5 inline-flex items-center gap-0.5"
              >
                Review queue <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Accepted / In Oven */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">In Oven / Baked</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
                {loading ? <Skeleton className="h-8 w-12" /> : acceptedOrdersCount}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5 block">Accepted orders</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Estimated Revenue */}
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Gross Revenue</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-pizza-red mt-1">
                {loading ? <Skeleton className="h-8 w-16" /> : `$${estimatedRevenue.toFixed(2)}`}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5 block">Fulfilled orders total</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-pizza-red flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Recipes', count: items.length },
              { id: 'active', label: 'Active', count: activeItemsCount },
              {
                id: 'inactive',
                label: 'Inactive',
                count: items.filter((i) => i.status === 'inactive').length,
              },
              {
                id: 'pending',
                label: 'In Review',
                count: items.filter((i) => i.status === 'pending').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedStatusTab === tab.id
                    ? 'bg-pizza-red text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedStatusTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search recipe name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
            />
          </div>
        </div>

        {/* Recipes Table */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-pizza-orange/10 text-pizza-orange flex items-center justify-center mx-auto mb-4">
              <Pizza className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
              No Recipes Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery || selectedStatusTab !== 'all'
                ? 'No recipes match your filter criteria.'
                : 'You have not added any pizza recipes to your oven catalog yet.'}
            </p>
            <Link href="/dashboard/vendor/menu/new">
              <Button className="bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold gap-1.5">
                <PlusCircle className="w-4 h-4" /> Add Your First Pizza
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Recipe / Item
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Category
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Price
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Kitchen Origin
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Visibility
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isItemInactive = item.status === 'inactive';
                  const isThisToggling = togglingId === item._id;

                  return (
                    <TableRow
                      key={item._id}
                      className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Image & Name */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.images[0] ||
                              'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300'
                            }
                            alt={item.itemName}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                              {item.itemName}
                            </h4>
                            <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-[220px]">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] text-zinc-600 dark:text-zinc-300">
                          {item.category}
                        </Badge>
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <span className="font-bold text-sm text-pizza-red">
                          ${item.price.toFixed(2)}
                        </span>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{item.location}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>

                      {/* Visibility Toggle Button */}
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isThisToggling}
                          onClick={() => handleToggleStatus(item)}
                          className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold gap-1.5 transition-all ${
                            isItemInactive
                              ? 'border-zinc-300 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          }`}
                        >
                          {isThisToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isItemInactive ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Inactive (Click to Show)</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Live (Click to Hide)</span>
                            </>
                          )}
                        </Button>
                      </TableCell>

                      {/* Action buttons */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/menu/${item._id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                              title="Preview Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingItemId(item._id)}
                            className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete Recipe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Recipe Deletion */}
      <Dialog
        open={!!deletingItemId}
        onOpenChange={(open) => !open && !isDeleting && setDeletingItemId(null)}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
              Delete Pizza Recipe
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Are you sure you want to permanently remove this recipe from your kitchen menu? This
              action cannot be undone and will unpublish it from the marketplace.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2.5 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeletingItemId(null)}
              className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9 gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Delete Recipe
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
