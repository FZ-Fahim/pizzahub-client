export type UserRole = 'customer' | 'vendor' | 'admin';
export type SubscriptionPlan = 'free' | 'premium';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  isBlocked: boolean;
  businessName?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiresAt?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export type MenuCategory =
  | 'Classic Pizzas'
  | 'Vegetarian Pizzas'
  | 'Meat Lovers'
  | 'Specialty / Gourmet Pizzas'
  | 'Sides & Appetizers'
  | 'Beverages & Desserts';

export type MenuItemStatus = 'pending' | 'approved' | 'rejected' | 'inactive';

export interface MenuItem {
  _id: string;
  vendorId: string | User;
  itemName: string;
  category: MenuCategory;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: MenuItemStatus;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface Order {
  _id: string;
  itemId: string | MenuItem;
  vendorId: string | User;
  customerId: string | User;
  deliveryDate: string; // YYYY-MM-DD
  deliveryAddress: string;
  message?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Transaction {
  _id: string;
  vendorId: string | User;
  plan: 'premium';
  amount: number;
  currency: string;
  stripeSessionId: string;
  stripeSubscriptionId?: string;
  status: 'completed' | 'failed';
  createdAt: string;
}

export interface Review {
  _id: string;
  itemId: string | MenuItem;
  customerId: string | User;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  error?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  pagination: PaginationMeta;
  data: T[];
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalCustomers: number;
  totalVendors: number;
  totalMenuItems: number;
  pendingMenuItems: number;
  approvedMenuItems: number;
  totalOrders: number;
  totalRevenue: number;
}
