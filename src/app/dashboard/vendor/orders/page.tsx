'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { orderApi } from '@/lib/api';
import { Order, MenuItem, User, OrderStatus } from '@/types';
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
  Pizza,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Search,
  RefreshCw,
  Calendar,
  MapPin,
  MessageSquare,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  Loader2,
  ChefHat,
  ChevronRight,
  Filter,
} from 'lucide-react';

// Demo fallback orders for new vendor accounts
const DEMO_VENDOR_ORDERS: Order[] = [
  {
    _id: 'ord_v_101',
    itemId: {
      _id: 'm_vendor_1',
      itemName: 'Margherita Verace D.O.P.',
      category: 'Classic Pizzas',
      description: 'Campania buffalo mozzarella, San Marzano tomatoes, fresh sweet basil.',
      price: 18.5,
      location: 'Little Italy, NY',
      images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'],
      status: 'approved',
      createdAt: new Date().toISOString(),
      vendorId: 'v_me',
    },
    vendorId: 'v_me',
    customerId: {
      _id: 'cust_alice',
      name: 'Alice Henderson',
      email: 'alice.henderson@example.com',
      role: 'customer',
      isBlocked: false,
      subscriptionPlan: 'free',
    },
    deliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    deliveryAddress: '124 Mulberry Street, Apt 4A, New York, NY',
    message: '[Slot: DINNER] Please bake crust extra crispy; leave with doorman.',
    status: 'pending',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    _id: 'ord_v_102',
    itemId: {
      _id: 'm_vendor_2',
      itemName: 'Tartufo & Porcini Supreme',
      category: 'Specialty / Gourmet Pizzas',
      description: 'Wild forest porcini mushrooms, fior di latte, black truffle emulsion.',
      price: 24.0,
      location: 'Downtown Chicago, IL',
      images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'],
      status: 'approved',
      createdAt: new Date().toISOString(),
      vendorId: 'v_me',
    },
    vendorId: 'v_me',
    customerId: {
      _id: 'cust_lucas',
      name: 'Lucas Rossi',
      email: 'lucas.rossi@example.com',
      role: 'customer',
      isBlocked: false,
      subscriptionPlan: 'free',
    },
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryAddress: '550 Michigan Ave, Unit 12B, Chicago, IL',
    message: '[Slot: LUNCH] Extra chili honey sauce on side.',
    status: 'accepted',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'ord_v_103',
    itemId: {
      _id: 'm_vendor_1',
      itemName: 'Margherita Verace D.O.P.',
      category: 'Classic Pizzas',
      description: 'Campania buffalo mozzarella, San Marzano tomatoes.',
      price: 18.5,
      location: 'Little Italy, NY',
      images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'],
      status: 'approved',
      createdAt: new Date().toISOString(),
      vendorId: 'v_me',
    },
    vendorId: 'v_me',
    customerId: {
      _id: 'cust_elena',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      role: 'customer',
      isBlocked: false,
      subscriptionPlan: 'free',
    },
    deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    deliveryAddress: '310 West End Ave, New York, NY',
    message: '[Slot: NIGHT] Ring bell upon arrival.',
    status: 'cancelled',
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function VendorOrdersPage() {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fetchOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let loadedOrders: Order[] = [];
      try {
        const res = await orderApi.getVendorOrders();
        if (res?.data && Array.isArray(res.data)) {
          loadedOrders = res.data;
        }
      } catch (err) {
        // Fallback
      }

      // Check localStorage for offline demo orders
      if (typeof window !== 'undefined') {
        try {
          const rawLocal = localStorage.getItem('pizzahub_vendor_orders');
          if (rawLocal) {
            const localList: Order[] = JSON.parse(rawLocal);
            const idMap = new Map<string, Order>();
            [...localList, ...loadedOrders].forEach((ord) => idMap.set(ord._id, ord));
            loadedOrders = Array.from(idMap.values());
          }
        } catch {
          // ignore
        }
      }

      // Sort newest first
      loadedOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setOrders(loadedOrders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Compute metrics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const accepted = orders.filter((o) => o.status === 'accepted').length;
    const rejectedOrCancelled = orders.filter(
      (o) => o.status === 'rejected' || o.status === 'cancelled'
    ).length;
    return { total, pending, accepted, rejectedOrCancelled };
  }, [orders]);

  // Single-Action Accept / Reject Handler
  const handleUpdateStatus = async (orderId: string, newStatus: 'accepted' | 'rejected') => {
    setActionInProgressId(orderId);
    setActionNotice(null);

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(orderId);
      if (isMongoId) {
        await orderApi.updateOrderStatus(orderId, newStatus);
      }

      // Update state locally
      const updatedList = orders.map((ord) =>
        ord._id === orderId
          ? {
              ...ord,
              status: newStatus as OrderStatus,
              updatedAt: new Date().toISOString(),
            }
          : ord
      );

      setOrders(updatedList);

      // Persist in local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('pizzahub_vendor_orders', JSON.stringify(updatedList));

        // Also update customer session cache if matched
        try {
          const rawCust = localStorage.getItem('pizzahub_customer_orders');
          if (rawCust) {
            const custList: Order[] = JSON.parse(rawCust);
            const cIdx = custList.findIndex((o) => o._id === orderId);
            if (cIdx !== -1) {
              custList[cIdx].status = newStatus as OrderStatus;
              custList[cIdx].updatedAt = new Date().toISOString();
              localStorage.setItem('pizzahub_customer_orders', JSON.stringify(custList));
            }
          }
        } catch {
          // ignore
        }
      }

      const ord = orders.find((o) => o._id === orderId);
      const itemName = typeof ord?.itemId === 'object' ? ord.itemId.itemName : 'Order';

      if (newStatus === 'accepted') {
        setActionNotice({
          type: 'success',
          text: `Order #${orderId.slice(-6).toUpperCase()} for "${itemName}" has been ACCEPTED! Added to 450°C stone oven queue.`,
        });
      } else {
        setActionNotice({
          type: 'success',
          text: `Order #${orderId.slice(-6).toUpperCase()} has been DECLINED. Customer notified.`,
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to update order status. Please try again.',
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Tab filter
      if (selectedStatusTab === 'pending' && ord.status !== 'pending') return false;
      if (selectedStatusTab === 'accepted' && ord.status !== 'accepted') return false;
      if (
        selectedStatusTab === 'closed' &&
        ord.status !== 'rejected' &&
        ord.status !== 'cancelled'
      )
        return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const itemObj = typeof ord.itemId === 'object' ? ord.itemId : null;
        const custObj = typeof ord.customerId === 'object' ? ord.customerId : null;

        const itemName = itemObj?.itemName?.toLowerCase() || '';
        const custName = custObj?.name?.toLowerCase() || '';
        const custEmail = custObj?.email?.toLowerCase() || '';
        const addr = ord.deliveryAddress.toLowerCase();
        const idMatch = ord._id.toLowerCase().includes(q);

        return (
          itemName.includes(q) ||
          custName.includes(q) ||
          custEmail.includes(q) ||
          addr.includes(q) ||
          idMatch
        );
      }

      return true;
    });
  }, [orders, selectedStatusTab, searchQuery]);

  // Status Badge Helper
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold gap-1 text-[11px]">
            <Flame className="w-3.5 h-3.5 text-emerald-500" /> Accepted · In Oven
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold gap-1 text-[11px] animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Action Required
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30 font-medium gap-1 text-[11px]">
            <XCircle className="w-3.5 h-3.5 text-zinc-500" /> Cancelled by Customer
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-medium gap-1 text-[11px]">
            <XCircle className="w-3.5 h-3.5 text-rose-500" /> Declined by Baker
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
            <ChefHat className="w-3.5 h-3.5" /> Kitchen Oven Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-zinc-900 dark:text-zinc-100">
            Customer Pizza Orders
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review incoming consumer tickets and confirm your stone-oven baking schedule.
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
            <span>Refresh Tickets</span>
          </Button>

          <Link href="/dashboard/vendor">
            <Button
              variant="outline"
              className="rounded-xl text-xs font-semibold gap-1.5 h-10 border-zinc-300 dark:border-zinc-700"
            >
              <Pizza className="w-3.5 h-3.5 text-pizza-red" />
              <span>Back to Menu Items</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Notification Banner */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-md ${
              actionNotice.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              {actionNotice.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{actionNotice.text}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-xs font-semibold underline hover:no-underline shrink-0"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Requests</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.total}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5 block">Lifetime orders</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pizza-orange/10 text-pizza-orange flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs ring-2 ring-amber-500/20">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 font-semibold">
                Pending Acceptance
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-600 dark:text-amber-400 mt-1">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.pending}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5 block">Awaiting single-click review</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Accepted / Baking</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.accepted}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5 block">In oven execution</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Void / Declined</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-600 dark:text-zinc-300 mt-1">
                {loading ? <Skeleton className="h-8 w-12" /> : stats.rejectedOrCancelled}
              </h3>
              <span className="text-[11px] text-zinc-400 mt-0.5 block">Closed tickets</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 text-zinc-500 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Filter & Controls Strip */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'pending', label: 'Action Needed', count: stats.pending, highlight: true },
              { id: 'accepted', label: 'In Oven', count: stats.accepted },
              { id: 'all', label: 'All Tickets', count: stats.total },
              { id: 'closed', label: 'Closed / Void', count: stats.rejectedOrCancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedStatusTab === tab.id
                    ? tab.highlight
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-pizza-red text-white shadow-xs'
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
              placeholder="Search pizza, customer, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
            />
          </div>
        </div>

        {/* Orders Listing: Table on Desktop, Cards on Mobile */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-pizza-orange/10 text-pizza-orange flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-serif text-zinc-900 dark:text-zinc-100">
              No Orders Found in This View
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery || selectedStatusTab !== 'all'
                ? 'No tickets match your filter criteria.'
                : 'Your oven queue is completely clear. Incoming customer orders will appear here automatically.'}
            </p>
            {selectedStatusTab !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStatusTab('all')}
                className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs"
              >
                View All Tickets
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Pizza Item
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Customer Details
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Schedule & Address
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Notes
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Current Status
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                    Single-Click Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const itemObj =
                    typeof order.itemId === 'object' ? (order.itemId as MenuItem) : null;
                  const custObj =
                    typeof order.customerId === 'object' ? (order.customerId as User) : null;

                  const itemName = itemObj?.itemName || 'Artisanal Wood-Fired Pizza';
                  const itemPrice = itemObj?.price || 18.5;
                  const itemImage =
                    itemObj?.images?.[0] ||
                    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300';
                  const customerName = custObj?.name || 'Pizza Connoisseur';
                  const customerEmail = custObj?.email || 'customer@pizzahub.com';

                  const isPending = order.status === 'pending';
                  const isProcessingThis = actionInProgressId === order._id;

                  return (
                    <TableRow
                      key={order._id}
                      className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Pizza Item */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={itemImage}
                            alt={itemName}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[170px]">
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

                      {/* Customer */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-700 dark:text-zinc-300 shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate block max-w-[130px]">
                              {customerName}
                            </span>
                            <span className="text-[10px] text-zinc-400 truncate block max-w-[130px]">
                              {customerEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Schedule & Address */}
                      <TableCell>
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                            <Calendar className="w-3.5 h-3.5 text-pizza-orange shrink-0" />
                            <span>{order.deliveryDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] truncate max-w-[160px]">
                            <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span className="truncate">{order.deliveryAddress}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Notes */}
                      <TableCell>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[150px] truncate">
                          {order.message || (
                            <span className="text-zinc-400 italic">No custom notes</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{renderStatusBadge(order.status)}</TableCell>

                      {/* Single Action Buttons */}
                      <TableCell className="text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Single Action Accept */}
                            <Button
                              size="sm"
                              disabled={isProcessingThis}
                              onClick={() => handleUpdateStatus(order._id, 'accepted')}
                              className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs transition-transform active:scale-95"
                            >
                              {isProcessingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Flame className="w-3.5 h-3.5" />
                              )}
                              <span>Accept (Fire Oven)</span>
                            </Button>

                            {/* Single Action Reject */}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessingThis}
                              onClick={() => handleUpdateStatus(order._id, 'rejected')}
                              className="h-8 px-2.5 rounded-xl border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium text-xs gap-1 transition-transform active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">
                            Decision Finalized
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
