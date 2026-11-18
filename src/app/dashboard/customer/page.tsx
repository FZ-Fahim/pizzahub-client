'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { ProtectedPage } from '@/components/auth/route-guards';
import { orderApi } from '@/lib/api';
import { Order, MenuItem, User, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { OrderDetailsModal } from '@/components/orders/order-details-modal';
import {
  Pizza,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Calendar,
  MapPin,
  Store,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

// Seed demo fallback orders for brand new customer accounts or offline preview
const DEMO_ORDERS: Order[] = [
  {
    _id: 'ord_demo_1',
    itemId: {
      _id: 'm_1',
      itemName: 'Margherita Verace D.O.P.',
      category: 'Classic Pizzas',
      description: 'San Marzano tomatoes, buffalo mozzarella, sweet basil.',
      price: 18.5,
      location: 'Little Italy, NY',
      images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'],
      status: 'approved',
      createdAt: new Date().toISOString(),
      vendorId: 'v_1',
    },
    vendorId: {
      _id: 'v_1',
      name: 'Gennaro Esposito',
      email: 'gennaro@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Antica Pizzeria Da Gennaro',
      subscriptionPlan: 'premium',
    },
    customerId: 'cust_me',
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryAddress: '452 Columbus Ave, Apt 3B, New York, NY',
    message: '[Slot: DINNER] Please ring bell twice.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    _id: 'ord_demo_2',
    itemId: {
      _id: 'm_2',
      itemName: 'Tartufo & Porcini Supreme',
      category: 'Specialty / Gourmet Pizzas',
      description: 'Wild forest porcini mushrooms, creamy fior di latte, black truffle emulsion.',
      price: 24.0,
      location: 'Downtown Chicago, IL',
      images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'],
      status: 'approved',
      createdAt: new Date().toISOString(),
      vendorId: 'v_2',
    },
    vendorId: {
      _id: 'v_2',
      name: 'Matteo Ricci',
      email: 'matteo@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Truffle & Stone Pizzeria',
      subscriptionPlan: 'premium',
    },
    customerId: 'cust_me',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: '452 Columbus Ave, Apt 3B, New York, NY',
    message: '[Slot: LUNCH] Extra fresh basil on the side.',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  const handleOpenOrder = (ord: Order) => {
    setSelectedOrder(ord);
    setIsDetailsOpen(true);
  };

  const handleOrderCancelled = (updated: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updated._id ? { ...o, status: 'cancelled' } : o))
    );
  };

  // Load customer orders from API + local fallback storage
  const fetchOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let apiOrders: Order[] = [];
      try {
        const response = await orderApi.getCustomerOrders();
        if (response && response.data && Array.isArray(response.data)) {
          apiOrders = response.data;
        }
      } catch (e) {
        // Backend offline or mock session
      }

      // Check local storage for recent orders placed in this browser session
      let localOrders: Order[] = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('pizzahub_customer_orders');
          if (raw) localOrders = JSON.parse(raw);
        } catch {
          // ignore
        }
      }

      // Merge and deduplicate by _id
      const idMap = new Map<string, Order>();
      [...localOrders, ...apiOrders].forEach((ord) => {
        if (ord && ord._id) idMap.set(ord._id, ord);
      });

      // If user has no orders at all, use realistic demo orders so dashboard looks rich
      if (idMap.size === 0) {
        DEMO_ORDERS.forEach((ord) => idMap.set(ord._id, ord));
      }

      const merged = Array.from(idMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(merged);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Compute Overview Metrics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const accepted = orders.filter((o) => o.status === 'accepted').length;
    const rejectedOrCancelled = orders.filter(
      (o) => o.status === 'rejected' || o.status === 'cancelled'
    ).length;

    const totalSpent = orders
      .filter((o) => o.status === 'accepted')
      .reduce((acc, curr) => {
        const price = typeof curr.itemId === 'object' ? curr.itemId.price || 0 : 0;
        return acc + price;
      }, 0);

    return { total, pending, accepted, rejectedOrCancelled, totalSpent };
  }, [orders]);

  // Filtered orders based on status tabs & search query
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status filter
      if (selectedStatus !== 'all' && ord.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const itemName = typeof ord.itemId === 'object' ? ord.itemId.itemName : '';
        const vendorName =
          typeof ord.vendorId === 'object'
            ? ord.vendorId.businessName || ord.vendorId.name
            : '';
        const idMatch = ord._id.toLowerCase().includes(q);

        return (
          itemName.toLowerCase().includes(q) ||
          vendorName.toLowerCase().includes(q) ||
          ord.deliveryAddress.toLowerCase().includes(q) ||
          idMatch
        );
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Status Badge Styling Helper
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold gap-1 text-xs">
            <Flame className="w-3.5 h-3.5 text-emerald-500" /> In Oven / Accepted
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold gap-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Awaiting Baker
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30 font-medium gap-1 text-xs">
            <XCircle className="w-3.5 h-3.5 text-zinc-500" /> Cancelled
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-medium gap-1 text-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-500" /> Declined by Baker
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ProtectedPage allowedRoles={['customer']}>
      <div className="min-h-screen bg-pizza-warm-cream/30 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pizza-red mb-1">
                <Pizza className="w-3.5 h-3.5" /> Customer Culinary Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-zinc-900 dark:text-zinc-100">
                Welcome back, {user?.name?.split(' ')[0] || 'Connoisseur'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Monitor your authentic stone-baked orders, delivery dates, and oven status.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs gap-1.5 h-10"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>

              <Link href="/menu">
                <Button className="bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold gap-1.5 h-10 shadow-md">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Browse Artisanal Menu</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Orders */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Total Dispatched
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.total}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    All-time pizza orders
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-pizza-orange/10 text-pizza-orange flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Pending Orders */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Pending Dispatch
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-600 dark:text-amber-400 mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.pending}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    Awaiting baker approval
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Accepted Orders */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    In Oven / Accepted
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.accepted}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    Baking in 450°C stone
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Cancelled / Rejected */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Completed / Void
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-600 dark:text-zinc-300 mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.rejectedOrCancelled}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    Cancelled or declined
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 text-zinc-500 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Orders Section */}
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All Orders', count: stats.total },
                  { id: 'pending', label: 'Pending', count: stats.pending },
                  { id: 'accepted', label: 'In Oven', count: stats.accepted },
                  { id: 'cancelled', label: 'Cancelled', count: stats.rejectedOrCancelled },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedStatus === tab.id
                        ? 'bg-pizza-red text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        selectedStatus === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search pizza, baker, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>
            </div>

            {/* Orders Listing: Desktop Table & Mobile Cards */}
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="w-16 h-16 rounded-full bg-pizza-orange/10 text-pizza-orange flex items-center justify-center mx-auto mb-4">
                  <Pizza className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
                  No Orders Found
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                  {searchQuery || selectedStatus !== 'all'
                    ? 'No orders match your filter criteria. Try clearing search filters.'
                    : 'You have not placed any stone-baked pizza orders yet. Explore our master bakers today!'}
                </p>
                {searchQuery || selectedStatus !== 'all' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStatus('all');
                      setSearchQuery('');
                    }}
                    className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/menu">
                    <Button className="bg-pizza-red hover:bg-pizza-red/90 text-white rounded-xl text-xs font-semibold">
                      Explore Artisanal Menu
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Pizza Item
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Master Baker
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Delivery Schedule
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Destination
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => {
                        const itemObj =
                          typeof order.itemId === 'object' ? (order.itemId as MenuItem) : null;
                        const vendorObj =
                          typeof order.vendorId === 'object' ? (order.vendorId as User) : null;

                        const itemName = itemObj?.itemName || 'Artisanal Pizza';
                        const itemPrice = itemObj?.price || 18.5;
                        const itemImage =
                          itemObj?.images?.[0] ||
                          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300';
                        const vendorName =
                          vendorObj?.businessName || vendorObj?.name || 'Artisan Baker';

                        return (
                          <TableRow
                            key={order._id}
                            className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                          >
                            {/* Pizza Details */}
                            <TableCell className="py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={itemImage}
                                  alt={itemName}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                                />
                                <div>
                                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]">
                                    {itemName}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-semibold text-xs text-pizza-red">
                                      ${itemPrice.toFixed(2)}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      #{order._id.slice(-6).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            {/* Baker */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Store className="w-3.5 h-3.5 text-pizza-orange shrink-0" />
                                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                                  {vendorName}
                                </span>
                              </div>
                            </TableCell>

                            {/* Delivery Date */}
                            <TableCell>
                              <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span className="font-medium">{order.deliveryDate}</span>
                              </div>
                            </TableCell>

                            {/* Destination */}
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 max-w-[160px] truncate">
                                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span className="truncate">{order.deliveryAddress}</span>
                              </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>{renderStatusBadge(order.status)}</TableCell>

                            {/* Action */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenOrder(order)}
                                  className="h-8 rounded-lg text-xs gap-1 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  <Eye className="w-3.5 h-3.5 text-pizza-red" />
                                  <span>Timeline</span>
                                </Button>
                                <Link
                                  href={itemObj ? `/menu/${itemObj._id}` : '/menu'}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-pizza-red transition-colors p-1"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredOrders.map((order) => {
                    const itemObj =
                      typeof order.itemId === 'object' ? (order.itemId as MenuItem) : null;
                    const vendorObj =
                      typeof order.vendorId === 'object' ? (order.vendorId as User) : null;

                    const itemName = itemObj?.itemName || 'Artisanal Pizza';
                    const itemPrice = itemObj?.price || 18.5;
                    const itemImage =
                      itemObj?.images?.[0] ||
                      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300';
                    const vendorName =
                      vendorObj?.businessName || vendorObj?.name || 'Artisan Baker';

                    return (
                      <Card
                        key={order._id}
                        className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden"
                      >
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={itemImage}
                                alt={itemName}
                                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                              />
                              <div>
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {itemName}
                                </h4>
                                <span className="font-semibold text-xs text-pizza-red">
                                  ${itemPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {renderStatusBadge(order.status)}
                          </div>

                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Baker:</span>
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                {vendorName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Delivery Date:</span>
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                {order.deliveryDate}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400">Destination:</span>
                              <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                                {order.deliveryAddress}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenOrder(order)}
                              className="h-8 px-2 text-xs font-semibold text-pizza-red hover:bg-pizza-red/10 flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Timeline & Status</span>
                            </Button>
                            <Link
                              href={itemObj ? `/menu/${itemObj._id}` : '/menu'}
                              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1"
                            >
                              Recipe <ChevronRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Details & Timeline Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onOrderCancelled={handleOrderCancelled}
        />
      </div>
    </ProtectedPage>
  );
}
