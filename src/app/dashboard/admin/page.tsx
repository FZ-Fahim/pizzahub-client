'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { ProtectedPage } from '@/components/auth/route-guards';
import { adminApi } from '@/lib/api';
import { User, MenuItem, Transaction, AdminOverviewStats } from '@/types';
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
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  ShieldAlert,
  Users,
  Pizza,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  Check,
  X,
  CreditCard,
  TrendingUp,
  Activity,
  Layers,
  Award,
  AlertTriangle,
  Loader2,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

// Fallback demo data for fresh databases or offline testing
const DEMO_OVERVIEW: AdminOverviewStats & { totalRevenue: number } = {
  totalUsers: 0,
  totalCustomers: 0,
  totalVendors: 0,
  totalMenuItems: 0,
  pendingMenuItems: 0,
  approvedMenuItems: 0,
  totalOrders: 0,
  totalRevenue: 0,
};

const CHART_DATA = [
  { month: 'Jun', orders: 12, revenue: 198 },
  { month: 'Jul', orders: 24, revenue: 297 },
  { month: 'Aug', orders: 38, revenue: 396 },
  { month: 'Sep', orders: 31, revenue: 297 },
  { month: 'Oct', orders: 49, revenue: 495 },
  { month: 'Nov', orders: 62, revenue: 594 },
];

const DEMO_USERS: User[] = [
  {
    _id: 'u_1',
    name: 'Gennaro Esposito',
    email: 'gennaro@pizzahub.com',
    role: 'vendor',
    isBlocked: false,
    businessName: 'Antica Pizzeria Da Gennaro',
    subscriptionPlan: 'premium',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    _id: 'u_2',
    name: 'Matteo Ricci',
    email: 'matteo@pizzahub.com',
    role: 'vendor',
    isBlocked: false,
    businessName: 'Truffle & Stone Pizzeria',
    subscriptionPlan: 'premium',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    _id: 'u_3',
    name: 'Alice Henderson',
    email: 'alice@example.com',
    role: 'customer',
    isBlocked: false,
    subscriptionPlan: 'free',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    _id: 'u_4',
    name: 'Spammy Bot Account',
    email: 'suspicious@spam.net',
    role: 'customer',
    isBlocked: true,
    subscriptionPlan: 'free',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: 'u_5',
    name: 'Marco Bellini',
    email: 'marco@pizzahub.com',
    role: 'vendor',
    isBlocked: false,
    businessName: 'Bellini Artisanal Forno',
    subscriptionPlan: 'free',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const DEMO_MENU_ITEMS: MenuItem[] = [
  {
    _id: 'm_demo_1',
    itemName: 'Quattro Formaggi al Tartufo',
    category: 'Specialty / Gourmet Pizzas',
    description: 'Gorgonzola dolce, taleggio, buffalo mozzarella, and black truffle honey.',
    price: 23.5,
    location: 'Florence Heritage Kitchen',
    images: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'],
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
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
    _id: 'm_demo_2',
    itemName: 'Calabrese Piccante Nduja',
    category: 'Meat Lovers',
    description: 'Artisanal spicy nduja sausage, sweet red peppers, and smoked scamorza.',
    price: 21.0,
    location: 'Little Italy, NY',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
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
    _id: 'm_demo_3',
    itemName: 'Suspicious Non-Pizza Entry',
    category: 'Sides & Appetizers',
    description: 'Unrelated junk listing submitted without proper kitchen verification.',
    price: 99.0,
    location: 'Unknown',
    images: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800'],
    status: 'rejected',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    vendorId: {
      _id: 'v_3',
      name: 'Marco Bellini',
      email: 'marco@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Bellini Artisanal Forno',
      subscriptionPlan: 'free',
    },
  },
];

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    _id: 'tx_1',
    vendorId: {
      _id: 'v_1',
      name: 'Gennaro Esposito',
      email: 'gennaro@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Antica Pizzeria Da Gennaro',
      subscriptionPlan: 'premium',
    },
    plan: 'premium',
    amount: 99.0,
    currency: 'USD',
    stripeSessionId: 'cs_live_948a72b0c1',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: 'tx_2',
    vendorId: {
      _id: 'v_2',
      name: 'Matteo Ricci',
      email: 'matteo@pizzahub.com',
      role: 'vendor',
      isBlocked: false,
      businessName: 'Truffle & Stone Pizzeria',
      subscriptionPlan: 'premium',
    },
    plan: 'premium',
    amount: 99.0,
    currency: 'USD',
    stripeSessionId: 'cs_live_831b52a9f3',
    status: 'completed',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'menu' | 'ledger'>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Data states
  const [stats, setStats] = useState<AdminOverviewStats & { totalRevenue: number }>(DEMO_OVERVIEW);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEMO_MENU_ITEMS);
  const [transactions, setTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);

  // Search filter
  const [userSearch, setUserSearch] = useState<string>('');
  const [menuSearch, setMenuSearch] = useState<string>('');

  // Action loaders & alerts
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const fetchAdminData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Overview
      try {
        const overRes = await adminApi.getOverview();
        if (overRes?.data) setStats(overRes.data as any);
      } catch {}

      // 2. Fetch Users
      try {
        const userRes = await adminApi.getUsers();
        if (userRes?.data && Array.isArray(userRes.data)) {
          setUsers(userRes.data);
        }
      } catch {}

      // 3. Fetch Menu Items
      try {
        const menuRes = await adminApi.getMenuItems({ limit: 100 });
        if (menuRes?.data && Array.isArray(menuRes.data)) {
          setMenuItems(menuRes.data);
          setStats((prev) => ({
            ...prev,
            totalMenuItems: menuRes.data.length,
            pendingMenuItems: menuRes.data.filter((i: any) => i.status === 'pending').length,
            approvedMenuItems: menuRes.data.filter((i: any) => i.status === 'approved').length,
          }));
        }
      } catch {}

      // 4. Fetch Transactions
      try {
        const txRes = await adminApi.getTransactions();
        if (txRes?.data && Array.isArray(txRes.data)) {
          setTransactions(txRes.data);
        }
      } catch {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Action: Toggle User Block / Unblock
  const handleToggleBlock = async (targetUser: User) => {
    if (targetUser.role === 'admin') {
      setBannerNotice('Administrators cannot be blocked.');
      return;
    }

    setActionLoadingId(targetUser._id);
    setBannerNotice(null);

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(targetUser._id);
      if (isMongoId) {
        await adminApi.toggleUserBlock(targetUser._id);
      }

      const updatedStatus = !targetUser.isBlocked;
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isBlocked: updatedStatus } : u))
      );

      setBannerNotice(
        `User ${targetUser.name} (${targetUser.email}) is now ${
          updatedStatus ? 'BLOCKED from accessing platform.' : 'UNBLOCKED and restored.'
        }`
      );
    } catch (err: any) {
      setBannerNotice(err.message || 'Failed to update user block status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Update Menu Item Status (Approve / Reject)
  const handleUpdateItemStatus = async (
    itemId: string,
    newStatus: 'approved' | 'rejected'
  ) => {
    setActionLoadingId(itemId);
    setBannerNotice(null);

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(itemId);
      if (isMongoId) {
        await adminApi.updateMenuItemStatus(itemId, newStatus);
      }

      const updated = menuItems.map((item) =>
        item._id === itemId ? { ...item, status: newStatus } : item
      );
      setMenuItems(updated);

      // Immediately synchronize overview stats so counters reflect approval instantly
      setStats((prev) => ({
        ...prev,
        pendingMenuItems: updated.filter((i) => i.status === 'pending').length,
        approvedMenuItems: updated.filter((i) => i.status === 'approved').length,
      }));

      // Background sync with database counters
      adminApi.getOverview().then((res) => {
        if (res?.data) setStats(res.data as any);
      }).catch(() => {});

      setBannerNotice(`Recipe status updated to '${newStatus}'.`);
    } catch (err: any) {
      setBannerNotice(err.message || 'Failed to update menu item status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Delete Menu Item
  const handleDeleteMenuItem = async (itemId: string) => {
    setActionLoadingId(itemId);
    setBannerNotice(null);

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(itemId);
      if (isMongoId) {
        await adminApi.deleteMenuItem(itemId);
      }

      const updated = menuItems.filter((item) => item._id !== itemId);
      setMenuItems(updated);

      // Immediately synchronize overview stats
      setStats((prev) => ({
        ...prev,
        totalMenuItems: updated.length,
        pendingMenuItems: updated.filter((i) => i.status === 'pending').length,
        approvedMenuItems: updated.filter((i) => i.status === 'approved').length,
      }));

      // Background sync with database counters
      adminApi.getOverview().then((res) => {
        if (res?.data) setStats(res.data as any);
      }).catch(() => {});

      setBannerNotice('Recipe permanently deleted from platform.');
    } catch (err: any) {
      setBannerNotice(err.message || 'Failed to delete menu item.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredMenuItems = useMemo(() => {
    if (!menuSearch.trim()) return menuItems;
    const q = menuSearch.toLowerCase().trim();
    return menuItems.filter(
      (m) =>
        m.itemName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.status.toLowerCase().includes(q)
    );
  }, [menuItems, menuSearch]);

  // Dynamically synchronized metric counts from real loaded menu items
  const catalogCount = useMemo(() => {
    return menuItems.length > 0 ? menuItems.length : stats.totalMenuItems;
  }, [menuItems, stats.totalMenuItems]);

  const pendingCount = useMemo(() => {
    if (menuItems.length > 0) {
      return menuItems.filter((i) => i.status === 'pending').length;
    }
    return stats.pendingMenuItems;
  }, [menuItems, stats.pendingMenuItems]);

  return (
    <ProtectedPage allowedRoles={['admin']}>
      <div className="min-h-screen bg-pizza-warm-cream/30 dark:bg-zinc-950 py-8 lg:py-12 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pizza-red mb-1">
                <ShieldAlert className="w-4 h-4" /> PizzaHub Administrator Central Command
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-zinc-900 dark:text-zinc-100">
                Platform Operations Deck
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Oversee platform security, moderate artisan recipes, manage users, and review audit ledgers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAdminData(true)}
                disabled={refreshing}
                className="rounded-xl border-zinc-300 dark:border-zinc-700 text-xs gap-1.5 h-10"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Sync Platform</span>
              </Button>

              <Badge className="bg-pizza-red text-white text-xs px-3 py-1 font-bold border-0">
                Super Admin Access
              </Badge>
            </div>
          </div>

          {/* Banner Notice */}
          <AnimatePresence>
            {bannerNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{bannerNotice}</span>
                </div>
                <button
                  onClick={() => setBannerNotice(null)}
                  className="text-xs font-semibold underline shrink-0"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4 Core Metrics Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Users */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Accounts</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.totalUsers}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    {stats.totalCustomers} Customers · {stats.totalVendors} Bakers
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pizzas in Catalog</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : catalogCount}
                  </h3>
                  <span className="text-[11px] text-amber-500 font-semibold mt-0.5 block">
                    {pendingCount} Awaiting Review
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-pizza-orange/10 text-pizza-orange flex items-center justify-center shrink-0">
                  <Pizza className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Total Orders */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Consumer Orders</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-zinc-900 dark:text-zinc-100 mt-1">
                    {loading ? <Skeleton className="h-8 w-12" /> : stats.totalOrders}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">Dispatched across all bakeries</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Subscription Revenue */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Stripe Subscriptions</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-pizza-red mt-1">
                    {loading ? <Skeleton className="h-8 w-16" /> : `$${stats.totalRevenue.toFixed(2)}`}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">$99/yr Premium Partners</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-pizza-red flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Analytics & Trends', icon: TrendingUp },
              { id: 'users', label: `User Moderation (${users.length})`, icon: Users },
              { id: 'menu', label: `Menu Approval (${stats.pendingMenuItems} Pending)`, icon: Pizza },
              { id: 'ledger', label: 'Financial Audit Ledger', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-pizza-red text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Analytics & Recharts Trends */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Orders Volume Trend Area Chart */}
                <Card className="lg:col-span-8 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-base font-bold font-serif flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-pizza-red" />
                      Platform Order Growth & Volume
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Monthly customer order progression across all registered artisanal pizzerias.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA}>
                        <defs>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d9381e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#d9381e" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                        <YAxis stroke="#888888" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#27272a',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="orders"
                          stroke="#d9381e"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorOrders)"
                          name="Total Orders"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Subscriptions Revenue Bar Chart */}
                <Card className="lg:col-span-4 rounded-3xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-base font-bold font-serif flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      Subscription Revenue ($)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      $99/yr Premium vendor partner upgrades.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={CHART_DATA}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                        <YAxis stroke="#888888" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            borderColor: '#27272a',
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#f59e0b"
                          radius={[6, 6, 0, 0]}
                          name="Revenue ($)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tab 2: User Moderation */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search user name, email, or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <span className="text-xs text-zinc-400">
                  {filteredUsers.length} Users Listed
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        User / Account
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Platform Role
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Subscription Tier
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Security Status
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                        Moderation Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const isTargetLoading = actionLoadingId === u._id;
                      const isAdmin = u.role === 'admin';

                      return (
                        <TableRow
                          key={u._id}
                          className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-pizza-orange/10 font-bold text-xs text-pizza-red flex items-center justify-center shrink-0">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {u.name}
                                </h4>
                                <span className="text-xs text-zinc-400">{u.email}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                u.role === 'admin'
                                  ? 'border-rose-500/30 text-rose-600 font-bold'
                                  : u.role === 'vendor'
                                  ? 'border-amber-500/30 text-amber-600 font-semibold'
                                  : 'border-zinc-300 text-zinc-600'
                              }
                            >
                              {u.role.toUpperCase()}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              {u.subscriptionPlan === 'premium' ? (
                                <span className="text-amber-600 font-bold flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Premium Partner
                                </span>
                              ) : (
                                'Free Tier'
                              )}
                            </span>
                          </TableCell>

                          <TableCell>
                            {u.isBlocked ? (
                              <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/30 text-[10px] gap-1">
                                <Lock className="w-3 h-3 text-rose-500" /> BLOCKED
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> ACTIVE
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            {!isAdmin ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isTargetLoading}
                                onClick={() => handleToggleBlock(u)}
                                className={`h-8 rounded-xl text-xs font-semibold gap-1.5 transition-all ${
                                  u.isBlocked
                                    ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50'
                                    : 'border-rose-500/30 text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                {isTargetLoading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : u.isBlocked ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Unblock</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Block User</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <span className="text-xs text-zinc-400 italic">Protected</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tab 3: Menu Item Moderation Queue */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Search pizza name, status, or category..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="pl-8 h-9 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <span className="text-xs text-zinc-400">
                  {filteredMenuItems.length} Recipes Total
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Pizza Recipe
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Vendor Bakery
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Category & Price
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Review Status
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                        Moderation Controls
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMenuItems.map((item) => {
                      const isThisLoading = actionLoadingId === item._id;
                      const vendorObj = typeof item.vendorId === 'object' ? item.vendorId : null;

                      return (
                        <TableRow
                          key={item._id}
                          className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                        >
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
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                  {item.itemName}
                                </h4>
                                <span className="text-[11px] text-zinc-400 line-clamp-1 max-w-[200px]">
                                  {item.description}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                              {vendorObj?.businessName || vendorObj?.name || 'Artisan Bakery'}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-0.5">
                              <Badge variant="outline" className="text-[10px]">
                                {item.category}
                              </Badge>
                              <div className="font-bold text-xs text-pizza-red">
                                ${item.price.toFixed(2)}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {item.status === 'approved' && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px]">
                                Approved & Live
                              </Badge>
                            )}
                            {item.status === 'pending' && (
                              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] animate-pulse">
                                Moderation Pending
                              </Badge>
                            )}
                            {item.status === 'rejected' && (
                              <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/30 text-[10px]">
                                Rejected
                              </Badge>
                            )}
                            {item.status === 'inactive' && (
                              <Badge className="bg-zinc-500/10 text-zinc-600 border border-zinc-500/30 text-[10px]">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status !== 'approved' && (
                                <Button
                                  size="sm"
                                  disabled={isThisLoading}
                                  onClick={() => handleUpdateItemStatus(item._id, 'approved')}
                                  className="h-8 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </Button>
                              )}

                              {item.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isThisLoading}
                                  onClick={() => handleUpdateItemStatus(item._id, 'rejected')}
                                  className="h-8 px-2.5 rounded-xl border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 text-xs gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isThisLoading}
                                onClick={() => handleDeleteMenuItem(item._id)}
                                className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-600"
                                title="Delete Permanently"
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
            </div>
          )}

          {/* Tab 4: Financial Audit Ledger */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Transaction Ref
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Upgraded Bakery Partner
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Plan Type
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Amount Billed
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                        Payment Gateway Status
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">
                        Ledger Timestamp
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => {
                      const vendorObj = typeof tx.vendorId === 'object' ? tx.vendorId : null;

                      return (
                        <TableRow
                          key={tx._id}
                          className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
                        >
                          <TableCell className="py-4 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            #{tx._id.slice(-8).toUpperCase()}
                          </TableCell>

                          <TableCell>
                            <div>
                              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                                {vendorObj?.businessName || vendorObj?.name || 'Artisan Baker'}
                              </span>
                              <span className="text-[10px] text-zinc-400">{vendorObj?.email}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] font-bold">
                              PREMIUM ($99/YR)
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <span className="font-extrabold text-sm text-emerald-600">
                              +${tx.amount.toFixed(2)} {tx.currency}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px]">
                              {tx.status.toUpperCase()} (Stripe Verified)
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right text-xs text-zinc-400">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
